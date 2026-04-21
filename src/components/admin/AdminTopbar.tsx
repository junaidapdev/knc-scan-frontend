import { useNavigate } from 'react-router-dom';

import { KayanLogo } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { adminLogout } from '@/lib/adminApi';
import { logger } from '@/lib/logger';

export default function AdminTopbar(): JSX.Element {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      await adminLogout();
    } catch (err) {
      logger.warn('[admin-topbar] logout API call failed', { err });
    }
    logout();
    navigate(ROUTES.ADMIN.LOGIN, { replace: true });
  };

  return (
    <header className="flex items-center justify-between border-b border-obsidian/10 bg-white px-6 py-3">
      <div className="flex items-center gap-4">
        <KayanLogo lang="en" height={28} />
        <div className="border-l border-obsidian/10 pl-4">
          <p className="text-sm font-semibold text-obsidian">
            {admin?.name ?? 'Admin'}
          </p>
          <p className="text-xs text-obsidian/60">{admin?.email ?? ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-md border border-obsidian/20 px-3 py-1.5 text-xs font-medium text-obsidian/40"
          disabled
          title="English only in V1"
        >
          EN
        </button>
        <button
          type="button"
          className="rounded-md bg-obsidian px-3 py-1.5 text-xs font-semibold text-white hover:bg-obsidian/90"
          onClick={() => {
            void handleLogout();
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
