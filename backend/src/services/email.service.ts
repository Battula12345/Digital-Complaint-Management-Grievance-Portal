import nodemailer from 'nodemailer';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

// Create transporter
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

let transporter = createTransporter();

export const initEmail = () => {
  transporter = createTransporter();
};

// Send email helper
const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  if (!transporter) {
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Complaint Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Get user email by ID
const getUserEmail = async (userId: number): Promise<{ email: string; name: string } | null> => {
  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT email, name FROM users WHERE id = ?',
      [userId]
    );
    return users.length > 0 ? { email: users[0].email, name: users[0].name } : null;
  } catch {
    return null;
  }
};

// Email Templates
const getResolvedEmailTemplate = (userName: string, complaintTitle: string, resolutionNotes: string, complaintId: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0; }
    .icon { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; }
    .icon svg { width: 40px; height: 40px; fill: white; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; }
    .message { color: #475569; line-height: 1.7; margin-bottom: 30px; }
    .complaint-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
    .complaint-title { font-weight: 600; color: #166534; font-size: 16px; margin-bottom: 8px; }
    .complaint-id { font-size: 13px; color: #15803d; margin-bottom: 15px; }
    .resolution-label { font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .resolution-text { color: #14532d; line-height: 1.6; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px; }
    .feedback-section { background: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
    .feedback-section h3 { color: #92400e; margin: 0 0 10px; font-size: 16px; }
    .feedback-section p { color: #a16207; margin: 0; font-size: 14px; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #64748b; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      </div>
      <h1>Complaint Resolved!</h1>
      <p>Great news - your issue has been fixed</p>
    </div>
    <div class="content">
      <p class="greeting">Hi ${userName},</p>
      <p class="message">We're pleased to inform you that your complaint has been successfully resolved by our team. Here are the details:</p>
      
      <div class="complaint-box">
        <div class="complaint-title">${complaintTitle}</div>
        <div class="complaint-id">Complaint ID: #${complaintId}</div>
        <div class="resolution-label">Resolution Notes</div>
        <div class="resolution-text">${resolutionNotes || 'Issue has been resolved.'}</div>
      </div>

      <div class="feedback-section">
        <h3>⭐ We'd love your feedback!</h3>
        <p>Please take a moment to rate your experience. Your feedback helps us improve our service.</p>
      </div>

      <center>
        <a href="http://localhost:4200/complaints" class="cta-button">View Complaint & Give Feedback</a>
      </center>
    </div>
    <div class="footer">
      <p>Thank you for using Complaint Portal</p>
      <p style="margin-top: 10px;">© 2025 Complaint Portal. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getStatusUpdateEmailTemplate = (userName: string, complaintTitle: string, oldStatus: string, newStatus: string, complaintId: number) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #1e293b; margin-bottom: 20px; }
    .message { color: #475569; line-height: 1.7; margin-bottom: 30px; }
    .status-box { background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px; }
    .complaint-title { font-weight: 600; color: #1e293b; font-size: 16px; margin-bottom: 15px; }
    .status-change { display: flex; align-items: center; justify-content: center; gap: 15px; }
    .status-badge { padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
    .status-old { background: #fee2e2; color: #dc2626; }
    .status-new { background: #dbeafe; color: #2563eb; }
    .status-arrow { color: #94a3b8; font-size: 20px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .footer { background: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #64748b; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Status Update</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${userName},</p>
      <p class="message">There's an update on your complaint:</p>
      
      <div class="status-box">
        <div class="complaint-title">${complaintTitle}</div>
        <div class="status-change">
          <span class="status-badge status-old">${oldStatus}</span>
          <span class="status-arrow">→</span>
          <span class="status-badge status-new">${newStatus}</span>
        </div>
      </div>

      <center>
        <a href="http://localhost:4200/complaints" class="cta-button">View Details</a>
      </center>
    </div>
    <div class="footer">
      <p>Complaint ID: #${complaintId}</p>
      <p style="margin-top: 10px;">© 2025 Complaint Portal</p>
    </div>
  </div>
</body>
</html>
`;

// Email notification functions
export class EmailService {
  // Send email when complaint is resolved
  static async notifyComplaintResolved(
    userId: number,
    complaintId: number,
    complaintTitle: string,
    resolutionNotes: string
  ): Promise<void> {
    const user = await getUserEmail(userId);
    if (!user) return;

    const html = getResolvedEmailTemplate(user.name, complaintTitle, resolutionNotes, complaintId);
    await sendEmail(user.email, `✅ Your Complaint "${complaintTitle}" Has Been Resolved`, html);
  }

  // Send email when status changes
  static async notifyStatusChange(
    userId: number,
    complaintId: number,
    complaintTitle: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const user = await getUserEmail(userId);
    if (!user) return;

    const html = getStatusUpdateEmailTemplate(user.name, complaintTitle, oldStatus, newStatus, complaintId);
    await sendEmail(user.email, `📋 Complaint Status Update: ${newStatus}`, html);
  }
}
