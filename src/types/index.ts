export interface User {
  id: number; // auto-incrementing primary key
  user_id: string; // unique ID with prefix (e.g., S123 for Student)
  email: string;
  password?: string; // Hashed password, optional in returned data
  role: 'student' | 'clerk' | 'dsw' | 'admin';
  created_at: string;
}

export interface Response {
  id: string;
  grievanceId: string;
  adminId: string;
  responseText: string;
  createdAt: string;
}

export interface Grievance {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'academic' | 'infrastructure' | 'administrative' | 'financial' | 'other';
  status: 'pending' | 'under-review' | 'in-progress' | 'resolved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  documents?: string[];
  feedback?: string;
  responses?: Response[];
}

export interface Statistic {
  id: string;
  resolution_rate: number;
  avg_response_time: number;
  grievances_resolved: number;
  user_satisfaction: number;
  last_updated: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}