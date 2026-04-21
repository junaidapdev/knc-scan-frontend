export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'viewer';
  last_login_at: string | null;
}
