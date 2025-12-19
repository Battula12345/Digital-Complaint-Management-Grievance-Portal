export type Role = 'User' | 'Staff' | 'Admin';
export type Status = 'Open' | 'Assigned' | 'In-progress' | 'Pending' | 'On-hold' | 'Rejected' | 'Resolved' | 'Closed';
export type Category = 'plumbing' | 'electrical' | 'facility' | 'maintenance' | 'cleaning' | 'security' | 'internet' | 'parking' | 'noise' | 'water' | 'ac' | 'elevator' | 'garbage' | 'pest' | 'lighting' | 'heating' | 'ventilation' | 'fire-safety' | 'structural' | 'landscaping' | 'furniture' | 'appliances' | 'doors-windows' | 'flooring' | 'other';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  contact_info?: string;
  created_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
