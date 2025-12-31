import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get current user profile
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, contact_info, address, latitude, longitude, created_at FROM users WHERE id = ?',
      [req.user!.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user profile
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, contact_info, address, latitude, longitude } = req.body;
    await pool.query(
      `UPDATE users SET 
        name = COALESCE(?, name), 
        contact_info = COALESCE(?, contact_info),
        address = COALESCE(?, address),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude)
      WHERE id = ?`,
      [name, contact_info, address, latitude, longitude, req.user!.id]
    );
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, role, contact_info, address, latitude, longitude, created_at FROM users WHERE id = ?',
      [req.user!.id]
    );
    res.json(users[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all staff members (Admin)
router.get('/staff', authenticate, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const [staff] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, contact_info, address, latitude, longitude FROM users WHERE role = "Staff"'
    );
    res.json(staff);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics (Admin)
router.get('/analytics', authenticate, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const [statusCounts] = await pool.query<RowDataPacket[]>(
      'SELECT status, COUNT(*) as count FROM complaints GROUP BY status'
    );
    const [categoryCounts] = await pool.query<RowDataPacket[]>(
      'SELECT category, COUNT(*) as count FROM complaints GROUP BY category'
    );
    const [totalUsers] = await pool.query<RowDataPacket[]>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    res.json({ statusCounts, categoryCounts, totalUsers });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
