import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

interface NotificationPayload {
  complaintId: number;
  complaintTitle: string;
  oldStatus?: string;
  newStatus: string;
  message: string;
}

export class NotificationService {
  // Notify user when complaint status changes (saves to database)
  static async notifyStatusChange(
    userId: number,
    payload: NotificationPayload
  ): Promise<void> {
    const title = `Complaint Update: ${payload.newStatus}`;
    const body = payload.message;
    await this.saveNotification(userId, title, body, payload);
  }

  // Notify staff when complaint is assigned
  static async notifyAssignment(
    staffId: number,
    payload: NotificationPayload
  ): Promise<void> {
    const title = 'New Complaint Assigned';
    const body = `You have been assigned: "${payload.complaintTitle}"`;
    await this.saveNotification(staffId, title, body, payload);
  }

  // Save notification to database for history
  static async saveNotification(
    userId: number,
    title: string,
    body: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, body, complaint_id, type, is_read)
         VALUES (?, ?, ?, ?, ?, false)`,
        [userId, title, body, payload.complaintId, 'status_change']
      );
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Get user's notifications
  static async getUserNotifications(userId: number, limit = 20): Promise<any[]> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit]
      );
      return rows;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?',
        [notificationId, userId]
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: number): Promise<void> {
    try {
      await pool.query(
        'UPDATE notifications SET is_read = true WHERE user_id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  // Get unread count
  static async getUnreadCount(userId: number): Promise<number> {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = false',
        [userId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}
