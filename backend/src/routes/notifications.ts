import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { NotificationService } from '../services/notification.service';

const router = Router();

// Get user's notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await NotificationService.getUserNotifications(req.user!.id, limit);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    await NotificationService.markAsRead(parseInt(req.params.id), req.user!.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
