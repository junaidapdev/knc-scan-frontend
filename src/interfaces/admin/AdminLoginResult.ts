import type { AdminUser } from './AdminUser';

export interface AdminLoginResult {
  token: string;
  expires_in_seconds: number;
  admin: AdminUser;
}
