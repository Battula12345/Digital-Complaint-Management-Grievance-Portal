import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../config/database';
import { authenticate } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get chat messages for a complaint
router.get('/:complaintId', authenticate, async (req: Request, res: Response) => {
  try {
    const complaintId = parseInt(req.params.complaintId);
    
    // Verify user has access to this complaint
    const [complaints] = await pool.query<RowDataPacket[]>(
      'SELECT user_id, staff_id FROM complaints WHERE id = ?',
      [complaintId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaint = complaints[0];
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check access: User can access their own complaints, Staff can access assigned complaints, Admin can access all
    if (userRole === 'User' && complaint.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (userRole === 'Staff' && complaint.staff_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get messages with sender info
    const [messages] = await pool.query<RowDataPacket[]>(
      `SELECT m.*, u.name as sender_name, u.role as sender_role 
       FROM chat_messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.complaint_id = ? 
       ORDER BY m.created_at ASC`,
      [complaintId]
    );

    // Mark messages as read for the current user
    await pool.query(
      'UPDATE chat_messages SET is_read = TRUE WHERE complaint_id = ? AND sender_id != ?',
      [complaintId, userId]
    );

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/:complaintId', authenticate, [
  body('message').notEmpty().withMessage('Message is required')
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const complaintId = parseInt(req.params.complaintId);
    const { message } = req.body;
    
    // Verify user has access to this complaint
    const [complaints] = await pool.query<RowDataPacket[]>(
      'SELECT user_id, staff_id, title FROM complaints WHERE id = ?',
      [complaintId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const complaint = complaints[0];
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Check access
    if (userRole === 'User' && complaint.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (userRole === 'Staff' && complaint.staff_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Insert message
    const [result] = await pool.query(
      'INSERT INTO chat_messages (complaint_id, sender_id, message) VALUES (?, ?, ?)',
      [complaintId, userId, message]
    );

    // Get the inserted message with sender info
    const [newMessage] = await pool.query<RowDataPacket[]>(
      `SELECT m.*, u.name as sender_name, u.role as sender_role 
       FROM chat_messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.id = ?`,
      [(result as any).insertId]
    );

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count for a complaint
router.get('/:complaintId/unread', authenticate, async (req: Request, res: Response) => {
  try {
    const complaintId = parseInt(req.params.complaintId);
    const userId = req.user!.id;

    const [result] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM chat_messages WHERE complaint_id = ? AND sender_id != ? AND is_read = FALSE',
      [complaintId, userId]
    );

    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total unread messages for current user across all complaints
router.get('/unread/total', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    let query = '';
    if (userRole === 'User') {
      query = `SELECT COUNT(*) as count FROM chat_messages m 
               JOIN complaints c ON m.complaint_id = c.id 
               WHERE c.user_id = ? AND m.sender_id != ? AND m.is_read = FALSE`;
    } else if (userRole === 'Staff') {
      query = `SELECT COUNT(*) as count FROM chat_messages m 
               JOIN complaints c ON m.complaint_id = c.id 
               WHERE c.staff_id = ? AND m.sender_id != ? AND m.is_read = FALSE`;
    } else {
      // Admin sees all unread
      query = `SELECT COUNT(*) as count FROM chat_messages WHERE sender_id != ? AND is_read = FALSE`;
      const [result] = await pool.query<RowDataPacket[]>(query, [userId]);
      return res.json({ count: result[0].count });
    }

    const [result] = await pool.query<RowDataPacket[]>(query, [userId, userId]);
    res.json({ count: result[0].count });
  } catch (error) {
    console.error('Get total unread error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
