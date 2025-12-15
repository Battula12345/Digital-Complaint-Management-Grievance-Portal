export type Role = 'User' | 'Staff' | 'Admin';
export type Status = 'Open' | 'Assigned' | 'In-progress' | 'Resolved';
export type Category = 'plumbing' | 'electrical' | 'facility' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  contact_info?: string;
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
  created_at: string;
  updated_at: string;
  user_name?: string;
  staff_name?: string;
  contact_info?: string;
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
