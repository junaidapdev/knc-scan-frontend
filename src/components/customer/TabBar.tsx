import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';

interface TabItem {
  to: string;
  labelKey: string;
  icon: string;
}

const TABS: readonly TabItem[] = [
  { to: ROUTES.CUSTOMER.HOME, labelKey: 'tabBar.home', icon: '🏠' },
  { to: ROUTES.CUSTOMER.REWARDS, labelKey: 'tabBar.rewards', icon: '🎁' },
  { to: ROUTES.CUSTOMER.PROFILE, labelKey: 'tabBar.profile', icon: '👤' },
] as const;

/**
 * Fixed bottom tab bar for the authenticated customer app.
 * Three tabs: Home, Rewards, Profile. Active tab shows a yellow pill.
 * RTL-aware via logical start/end utilities.
 */
export default function TabBar(): JSX.Element {
  const { t } = useTranslation('customer');

  return (
    <nav
      aria-label={t('tabBar.ariaLabel')}
      className="fixed inset-x-0 bottom-0 z-40 border-t-hairline border-obsidian/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-between gap-1 px-3 pb-[env(safe-area-inset-bottom)] pt-2">
        {TABS.map((tab) => (
          <li key={tab.to} className="flex-1">
            <NavLink
              to={tab.to}
              end
              className={({ isActive }) =>
                [
                  'flex flex-col items-center justify-center gap-1 rounded-lg py-2 transition-colors',
                  isActive
                    ? 'bg-yellow-tint text-obsidian'
                    : 'text-obsidian/60 hover:text-obsidian',
                ].join(' ')
              }
            >
              <span aria-hidden="true" className="text-[20px] leading-none">
                {tab.icon}
              </span>
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[1.5px]">
                {t(tab.labelKey)}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
