import type { SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/constants/routes';

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

function HomeIcon({ filled, ...props }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9.5V20a.5.5 0 0 0 .5.5h4V15a2 2 0 0 1 4 0v5.5h4a.5.5 0 0 0 .5-.5V9.5" />
    </svg>
  );
}

function GiftIcon({ filled, ...props }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3.5" y="8.5" width="17" height="5" rx="1" />
      <path d="M5 13.5V20a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-6.5" />
      <path d="M12 8.5v12" />
      <path d="M12 8.5c-1.8 0-4-.6-4-2.5S9.5 3 12 8.5Zm0 0c1.8 0 4-.6 4-2.5S14.5 3 12 8.5Z" />
    </svg>
  );
}

function UserIcon({ filled, ...props }: IconProps): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={filled ? 2.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  );
}

interface TabItem {
  to: string;
  labelKey: string;
  Icon: (props: IconProps) => JSX.Element;
}

const TABS: readonly TabItem[] = [
  { to: ROUTES.CUSTOMER.HOME, labelKey: 'tabBar.home', Icon: HomeIcon },
  { to: ROUTES.CUSTOMER.REWARDS, labelKey: 'tabBar.rewards', Icon: GiftIcon },
  { to: ROUTES.CUSTOMER.PROFILE, labelKey: 'tabBar.profile', Icon: UserIcon },
] as const;

/**
 * Fixed bottom tab bar for the authenticated customer app.
 * Active tab: yellow top indicator + obsidian icon/label.
 * Inactive:   muted obsidian, thinner strokes.
 * RTL-safe via logical utilities; respects iOS safe area.
 */
export default function TabBar(): JSX.Element {
  const { t } = useTranslation('customer');

  return (
    <nav
      aria-label={t('tabBar.ariaLabel')}
      className="fixed inset-x-0 bottom-0 z-40 border-t-hairline border-obsidian/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, labelKey, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                [
                  'group relative flex flex-col items-center justify-center gap-1 pt-3 pb-2',
                  'transition-colors duration-150',
                  isActive
                    ? 'text-obsidian'
                    : 'text-obsidian/45 hover:text-obsidian/80',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={[
                      'absolute inset-x-4 top-0 h-[3px] rounded-full transition-all duration-200',
                      isActive
                        ? 'bg-yellow opacity-100'
                        : 'bg-transparent opacity-0',
                    ].join(' ')}
                  />
                  <Icon filled={isActive} className="h-6 w-6" />
                  <span
                    className={[
                      'font-sans text-[10px] uppercase tracking-[2px] leading-none',
                      isActive ? 'font-semibold' : 'font-medium',
                    ].join(' ')}
                  >
                    {t(labelKey)}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
