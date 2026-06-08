import { User } from '@prisma/client';

export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;
export type UserProfile = Pick<
  User,
  'id' | 'name' | 'isSuperAdmin' | 'createdAt'
>;

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface PaginatedUsers {
  users: UserProfile[];
  total: number;
  page: number;
  limit: number;
}

