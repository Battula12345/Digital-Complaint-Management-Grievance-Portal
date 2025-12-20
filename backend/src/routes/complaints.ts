import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';
import multer from 'multer';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Create complaint (User)
router.post('/', authenticate, authorize('User'), upload.single('attachment'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['plumbing', 'electrical', 'facility', 'other']).withMessage('Invalid Category')
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category } = req.body;
    const attachments = req.file ? req.file.path : null;

    const [result] = await pool.query(
      'INSERT INTO complaints (user_id, title, description, category, attachments) VALUES (?, ?, ?, ?, ?)',
      [req.user!.id, title, description, category, attachments]
    );

    res.status(201).json({ message: 'Complaint submitted successfully', complaintId: (result as any).insertId });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's complaints
router.get('/my', authenticate, authorize('User'), async (req: Request, res: Response) => {
  try {
    const [complaints] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.name as staff_name FROM complaints c 
       LEFT JOIN users u ON c.staff_id = u.id 
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [req.user!.id]
    );
    res.json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned complaints (Staff)
router.get('/assigned', authenticate, authorize('Staff'), async (req: Request, res: Response) => {
  try {
    const [complaints] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.name as user_name, u.contact_info FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.staff_id = ? ORDER BY c.created_at DESC`,
      [req.user!.id]
    );
    res.json(complaints);
  } catch (error) {
    console.error('Get assigned complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all complaints (Admin)
router.get('/all', authenticate, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const [complaints] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.name as user_name, s.name as staff_name FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       LEFT JOIN users s ON c.staff_id = s.id 
       ORDER BY c.created_at DESC`
    );
    res.json(complaints);
  } catch (error) {
    console.error('Get all complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single complaint
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const [complaints] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.name as user_name, s.name as staff_name FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       LEFT JOIN users s ON c.staff_id = s.id 
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaint = complaints[0];
    if (req.user!.role === 'User' && complaint.user_id !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user!.role === 'Staff' && complaint.staff_id !== req.user!.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign complaint (Admin)
router.patch('/:id/assign', authenticate, authorize('Admin'), [
  body('staff_id').isInt().withMessage('Valid staff ID is required')
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { staff_id } = req.body;
    const [staff] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE id = ? AND role = "Staff"', [staff_id]);
    
    if (staff.length === 0) {
      return res.status(400).json({ message: 'Invalid staff member' });
    }

    await pool.query('UPDATE complaints SET staff_id = ?, status = "Assigned" WHERE id = ?', [staff_id, req.params.id]);
    res.json({ message: 'Complaint assigned successfully' });
  } catch (error) {
    console.error('Assign complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update status (Staff)
router.patch('/:id/status', authenticate, authorize('Staff'), [
  body('status').isIn(['In-progress', 'Resolved']).withMessage('Invalid status'),
  body('resolution_notes').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status, resolution_notes } = req.body;
    const [complaints] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM complaints WHERE id = ? AND staff_id = ?',
      [req.params.id, req.user!.id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }

    await pool.query(
      'UPDATE complaints SET status = ?, resolution_notes = COALESCE(?, resolution_notes) WHERE id = ?',
      [status, resolution_notes, req.params.id]
    );
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
