export type Role = 'User' | 'Staff' | 'Admin';
export type Status = 'Open' | 'Assigned' | 'In-progress' | 'Resolved';
export type Category = 'plumbing' | 'electrical' | 'facility' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  contact_info?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export interface Complaint {
  id: number;
  user_id: number;
  staff_id?: number;
  title: string;
  description: string;
  category: Category;
  status: Status;
  attachments?: string;
  resolution_notes?: string;
  feedback_rating?: number;
  feedback_comment?: string;
  latitude?: number;
  longitude?: number;
  location_address?: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  staff_name?: string;
  contact_info?: string;
}

export interface Feedback {
  id: number;
  complaint_id: number;
  complaint_title: string;
  user_name: string;
  staff_name?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Analytics {
  statusCounts: { status: Status; count: number }[];
  categoryCounts: { category: Category; count: number }[];
  totalUsers: { role: Role; count: number }[];
}

export interface ChatMessage {
  id: number;
  complaint_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: Role;
  message: string;
  is_read: boolean;
  created_at: string;
}
