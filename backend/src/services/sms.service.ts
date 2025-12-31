const twilio = require('twilio');
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client: any = null;

export const initSMS = () => {
  if (accountSid && authToken && fromNumber) {
    client = twilio(accountSid, authToken);
    return true;
  }
  return false;
};

export const sendSMS = async (to: string, message: string): Promise<boolean> => {
  if (!client || !fromNumber) {
    return false;
  }

  if (!to) {
    return false;
  }

  try {
    // Format phone number (add country code if not present)
    let phoneNumber = to.replace(/\s+/g, '').replace(/-/g, '');
    if (!phoneNumber.startsWith('+')) {
      // Default to India country code, change as needed
      phoneNumber = '+91' + phoneNumber.replace(/^0+/, '');
    }

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: phoneNumber
    });

    console.log(`SMS sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

export class SMSNotificationService {
  
  // Get all admin phone numbers
  static async getAdminPhones(): Promise<string[]> {
    try {
      const [admins] = await pool.query<RowDataPacket[]>(
        'SELECT contact_info FROM users WHERE role = "Admin" AND contact_info IS NOT NULL'
      );
      return admins.map(a => a.contact_info).filter(Boolean);
    } catch (error) {
      console.error('Error getting admin phones:', error);
      return [];
    }
  }

  // Get staff phone number by ID
  static async getStaffPhone(staffId: number): Promise<string | null> {
    try {
      const [staff] = await pool.query<RowDataPacket[]>(
        'SELECT contact_info FROM users WHERE id = ? AND role = "Staff"',
        [staffId]
      );
      return staff.length > 0 ? staff[0].contact_info : null;
    } catch (error) {
      console.error('Error getting staff phone:', error);
      return null;
    }
  }

  // Get user phone number by ID
  static async getUserPhone(userId: number): Promise<string | null> {
    try {
      const [users] = await pool.query<RowDataPacket[]>(
        'SELECT contact_info FROM users WHERE id = ?',
        [userId]
      );
      return users.length > 0 ? users[0].contact_info : null;
    } catch (error) {
      console.error('Error getting user phone:', error);
      return null;
    }
  }

  // ============ USER NOTIFICATIONS ============
  
  // Notify user when complaint status changes
  static async notifyUserStatusChange(
    userId: number,
    complaintTitle: string,
    newStatus: string
  ): Promise<void> {
    const phone = await this.getUserPhone(userId);
    if (!phone) return;

    let message = '';
    
    if (newStatus === 'Assigned') {
      message = `Grievance Portal: Your complaint "${complaintTitle}" has been assigned to a staff member.`;
    } else if (newStatus === 'In-progress') {
      message = `Grievance Portal: Your complaint "${complaintTitle}" is now being worked on.`;
    } else if (newStatus === 'Resolved') {
      message = `Grievance Portal: Your complaint "${complaintTitle}" has been resolved. Please login to provide feedback.`;
    } else {
      message = `Grievance Portal: Your complaint "${complaintTitle}" status: ${newStatus}.`;
    }

    await sendSMS(phone, message);
  }

  // Notify user when complaint is created
  static async notifyUserComplaintCreated(
    userId: number,
    complaintTitle: string,
    complaintId: number
  ): Promise<void> {
    const phone = await this.getUserPhone(userId);
    if (!phone) return;

    const message = `Grievance Portal: Your complaint "${complaintTitle}" (ID: ${complaintId}) has been registered successfully.`;
    await sendSMS(phone, message);
  }

  // ============ STAFF NOTIFICATIONS ============

  // Notify staff when complaint is assigned to them
  static async notifyStaffAssignment(
    staffId: number,
    complaintTitle: string,
    userName: string
  ): Promise<void> {
    const phone = await this.getStaffPhone(staffId);
    if (!phone) return;

    const message = `Grievance Portal: New complaint assigned - "${complaintTitle}" from ${userName}. Please login to take action.`;
    await sendSMS(phone, message);
  }

  // Notify staff when user provides feedback
  static async notifyStaffFeedback(
    staffId: number,
    complaintTitle: string,
    rating: number
  ): Promise<void> {
    const phone = await this.getStaffPhone(staffId);
    if (!phone) return;

    const message = `Grievance Portal: User rated your resolution for "${complaintTitle}" - ${rating}/5 stars.`;
    await sendSMS(phone, message);
  }

  // ============ ADMIN NOTIFICATIONS ============

  // Notify all admins when new complaint is created
  static async notifyAdminsNewComplaint(
    complaintTitle: string,
    userName: string,
    category: string
  ): Promise<void> {
    const adminPhones = await this.getAdminPhones();
    
    const message = `Grievance Portal: New complaint - "${complaintTitle}" (${category}) from ${userName}. Please assign to staff.`;
    
    for (const phone of adminPhones) {
      await sendSMS(phone, message);
    }
  }

  // Notify all admins when complaint is resolved
  static async notifyAdminsComplaintResolved(
    complaintTitle: string,
    staffName: string
  ): Promise<void> {
    const adminPhones = await this.getAdminPhones();
    
    const message = `Grievance Portal: Complaint "${complaintTitle}" resolved by ${staffName}.`;
    
    for (const phone of adminPhones) {
      await sendSMS(phone, message);
    }
  }

  // Notify all admins when user gives feedback
  static async notifyAdminsFeedback(
    complaintTitle: string,
    rating: number,
    userName: string
  ): Promise<void> {
    const adminPhones = await this.getAdminPhones();
    
    const message = `Grievance Portal: Feedback received - "${complaintTitle}" rated ${rating}/5 by ${userName}.`;
    
    for (const phone of adminPhones) {
      await sendSMS(phone, message);
    }
  }
}
