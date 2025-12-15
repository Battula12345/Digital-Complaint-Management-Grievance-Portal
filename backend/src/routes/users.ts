import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Get all staff members (Admin)
router.get('/staff', authenticate, authorize('Admin'), async (req: Request, res: Response) => {
  try {
    const [staff] = await pool.query<RowDataPacket[]>(
      'SELECT id, name, email, contact_info FROM users WHERE role = "Staff"'
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
