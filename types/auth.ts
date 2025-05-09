export type UserRole = 'admin' | 'user';
export type UserType = 'management' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  user_type: UserType;
  createdAt: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
