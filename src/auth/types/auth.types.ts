import { User } from '@prisma/client';

export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt'>;

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}
