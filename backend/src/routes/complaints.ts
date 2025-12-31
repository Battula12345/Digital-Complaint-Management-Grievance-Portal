import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';
import multer from 'multer';
import path from 'path';
import { NotificationService } from '../services/notification.service';
import { SMSNotificationService } from '../services/sms.service';
import { EmailService } from '../services/email.service';

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
  body('category').isIn(['plumbing', 'electrical', 'facility', 'maintenance', 'cleaning', 'security', 'internet', 'parking', 'noise', 'water', 'ac', 'elevator', 'garbage', 'pest', 'lighting', 'heating', 'ventilation', 'fire-safety', 'structural', 'landscaping', 'furniture', 'appliances', 'doors-windows', 'flooring', 'other']).withMessage('Invalid Category'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }),
  body('longitude').optional().isFloat({ min: -180, max: 180 }),
  body('location_address').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, category, latitude, longitude, location_address } = req.body;
    const attachments = req.file ? req.file.path : null;

    const [result] = await pool.query(
      'INSERT INTO complaints (user_id, title, description, category, attachments, latitude, longitude, location_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user!.id, title, description, category, attachments, latitude || null, longitude || null, location_address || null]
    );

    const complaintId = (result as any).insertId;

    // Get user name for admin notification
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT name FROM users WHERE id = ?',
      [req.user!.id]
    );
    const userName = users.length > 0 ? users[0].name : 'User';

    // Send SMS notifications
    // 1. Notify user (confirmation)
    SMSNotificationService.notifyUserComplaintCreated(req.user!.id, title, complaintId);
    // 2. Notify all admins about new complaint
    SMSNotificationService.notifyAdminsNewComplaint(title, userName, category);

    res.status(201).json({ message: 'Complaint submitted successfully', complaintId });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's complaints
router.get('/my', authenticate, authorize('User'), async (req: Request, res: Response) => {
  try {
    // Get user's saved location
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT latitude, longitude, address FROM users WHERE id = ?',
      [req.user!.id]
    );
    const userLocation = users.length > 0 ? users[0] : null;

    const [complaints] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.name as staff_name FROM complaints c 
       LEFT JOIN users u ON c.staff_id = u.id 
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [req.user!.id]
    );

    // If complaint doesn't have location, use user's saved location
    const complaintsWithLocation = complaints.map(c => ({
      ...c,
      latitude: c.latitude || (userLocation ? userLocation.latitude : null),
      longitude: c.longitude || (userLocation ? userLocation.longitude : null),
      location_address: c.location_address || (userLocation ? userLocation.address : null)
    }));

    res.json(complaintsWithLocation);
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned complaints (Staff)
router.get('/assigned', authenticate, authorize('Staff'), async (req: Request, res: Response) => {
  try {
    const [complaints] = await pool.query<RowDataPacket[]>(
      `SELECT c.*, u.name as user_name, u.contact_info, u.address as user_address, u.latitude as user_latitude, u.longitude as user_longitude FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.staff_id = ? ORDER BY c.created_at DESC`,
      [req.user!.id]
    );
    
    // If complaint doesn't have location, use user's saved location
    const complaintsWithLocation = complaints.map(c => ({
      ...c,
      latitude: c.latitude || c.user_latitude,
      longitude: c.longitude || c.user_longitude,
      location_address: c.location_address || c.user_address
    }));
    
    res.json(complaintsWithLocation);
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

    // Get complaint details for notification
    const [complaints] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, user_id FROM complaints WHERE id = ?',
      [req.params.id]
    );

    await pool.query('UPDATE complaints SET staff_id = ?, status = "Assigned" WHERE id = ?', [staff_id, req.params.id]);

    // Send notification to staff
    if (complaints.length > 0) {
      const complaint = complaints[0];
      await NotificationService.notifyAssignment(staff_id, {
        complaintId: complaint.id,
        complaintTitle: complaint.title,
        newStatus: 'Assigned',
        message: `You have been assigned a new complaint: "${complaint.title}"`
      });

      // Notify user that their complaint was assigned
      await NotificationService.notifyStatusChange(complaint.user_id, {
        complaintId: complaint.id,
        complaintTitle: complaint.title,
        newStatus: 'Assigned',
        message: `Your complaint "${complaint.title}" has been assigned to a staff member`
      });

      // Get user name for SMS
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT name FROM users WHERE id = ?',
        [complaint.user_id]
      );
      const userName = users.length > 0 ? users[0].name : 'User';

      // Send SMS notifications
      // 1. Notify user about assignment
      SMSNotificationService.notifyUserStatusChange(complaint.user_id, complaint.title, 'Assigned');
      // 2. Notify staff about new assignment
      SMSNotificationService.notifyStaffAssignment(staff_id, complaint.title, userName);
    }

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
      'SELECT c.*, u.name as user_name FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ? AND c.staff_id = ?',
      [req.params.id, req.user!.id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found or not assigned to you' });
    }

    const complaint = complaints[0];
    const oldStatus = complaint.status;

    await pool.query(
      'UPDATE complaints SET status = ?, resolution_notes = COALESCE(?, resolution_notes) WHERE id = ?',
      [status, resolution_notes, req.params.id]
    );

    // Send notification to user about status change
    let message = `Your complaint "${complaint.title}" status changed from ${oldStatus} to ${status}`;
    if (status === 'Resolved') {
      message = `Great news! Your complaint "${complaint.title}" has been resolved`;
    }

    await NotificationService.notifyStatusChange(complaint.user_id, {
      complaintId: complaint.id,
      complaintTitle: complaint.title,
      oldStatus,
      newStatus: status,
      message
    });

    // Get staff name for admin notification
    const [staffUsers] = await pool.query<RowDataPacket[]>(
      'SELECT name FROM users WHERE id = ?',
      [req.user!.id]
    );
    const staffName = staffUsers.length > 0 ? staffUsers[0].name : 'Staff';

    // Send SMS notifications
    // 1. Notify user about status change
    SMSNotificationService.notifyUserStatusChange(complaint.user_id, complaint.title, status);
    
    // 2. If resolved, notify admins
    if (status === 'Resolved') {
      SMSNotificationService.notifyAdminsComplaintResolved(complaint.title, staffName);
      // 3. Send email to user when complaint is resolved
      EmailService.notifyComplaintResolved(complaint.user_id, complaint.id, complaint.title, resolution_notes || '');
    } else {
      // Send email for status change (In-progress)
      EmailService.notifyStatusChange(complaint.user_id, complaint.id, complaint.title, oldStatus, status);
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit feedback for resolved complaint (User)
router.patch('/:id/feedback', authenticate, authorize('User'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString()
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { rating, comment } = req.body;
    const [complaints] = await pool.query<RowDataPacket[]>(
      'SELECT c.*, u.name as user_name FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = ? AND c.user_id = ?',
      [req.params.id, req.user!.id]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaint = complaints[0];

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Can only provide feedback for resolved complaints' });
    }

    if (complaint.feedback_rating) {
      return res.status(400).json({ message: 'Feedback already submitted for this complaint' });
    }

    await pool.query(
      'UPDATE complaints SET feedback_rating = ?, feedback_comment = ? WHERE id = ?',
      [rating, comment, req.params.id]
    );

    // Send SMS notifications for feedback
    // 1. Notify staff who resolved the complaint
    if (complaint.staff_id) {
      SMSNotificationService.notifyStaffFeedback(complaint.staff_id, complaint.title, rating);
    }
    // 2. Notify admins about feedback
    SMSNotificationService.notifyAdminsFeedback(complaint.title, rating, complaint.user_name);

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedbacks (Admin)
router.get('/feedbacks/all', authenticate, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const [feedbacks] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.title as complaint_title, c.feedback_rating as rating, c.feedback_comment as comment, 
       c.updated_at as created_at, u.name as user_name, s.name as staff_name
       FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       LEFT JOIN users s ON c.staff_id = s.id 
       WHERE c.feedback_rating IS NOT NULL 
       ORDER BY c.updated_at DESC`
    );
    res.json(feedbacks);
  } catch (error) {
    console.error('Get feedbacks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
