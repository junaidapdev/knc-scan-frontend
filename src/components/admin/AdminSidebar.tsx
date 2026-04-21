import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';

const LINKS: Array<{ label: string; to: string }> = [
  { label: 'Dashboard', to: ROUTES.ADMIN.DASHBOARD },
  { label: 'Branches', to: ROUTES.ADMIN.BRANCHES },
  { label: 'Customers', to: ROUTES.ADMIN.CUSTOMERS },
  { label: 'Rewards Catalog', to: ROUTES.ADMIN.REWARDS_CATALOG },
  { label: 'Redemption Log', to: ROUTES.ADMIN.REWARDS_ISSUED },
];

export default function AdminSidebar(): JSX.Element {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-e border-obsidian/10 bg-obsidian text-white">
      <div className="px-5 py-6">
        <p className="font-display text-xl uppercase tracking-[3px] text-yellow">
          Kayan
        </p>
        <p className="text-xs uppercase tracking-wider text-white/50">
          Admin Console
        </p>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-yellow text-obsidian'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
