import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  KSLogoMark,
  LanguageToggle,
  PageTransition,
} from '@/components/common';
import { InstallAppRow, TabBar } from '@/components/customer';
import { APP_VERSION } from '@/constants/ui';
import { ROUTES } from '@/constants/routes';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';

function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last4 = digits.slice(-4);
  return `+966 ••• ••• ${last4}`;
}

function initial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '•';
  return trimmed.charAt(0).toUpperCase();
}

export default function ProfilePage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();
  const auth = useCustomerAuth();
  const { state: profileState } = useMyProfile();

  const name =
    (profileState.status === 'ready' ? profileState.profile.name : null) ??
    auth.session?.customer.name ??
    '';
  const phone = auth.session?.customer.phone ?? '';
  const totalVisits =
    profileState.status === 'ready' ? profileState.profile.total_visits : null;
  const cardsCompleted =
    profileState.status === 'ready' ? profileState.profile.cards_completed : null;

  const onLogout = (): void => {
    auth.logout();
    navigate(ROUTES.CUSTOMER.SCAN, { replace: true });
  };

  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-yellow focus:px-3 focus:py-2 focus:text-obsidian"
      >
        Skip to content
      </a>

      <header
        className="flex items-center justify-between px-5"
        style={{
          height: 60,
          borderBottom: '1px solid rgba(13,13,13,0.06)',
        }}
      >
        <KSLogoMark size={40} />
        <LanguageToggle />
      </header>

      <main
        id="main"
        className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-28 pt-4"
      >
        <PageTransition>
          {/* Page heading */}
          <h1
            className="mb-4 font-display font-black text-obsidian"
            style={{ fontSize: 40, lineHeight: 0.95, letterSpacing: '-1.2px' }}
          >
            {t('profile.headline')}
          </h1>

          {/* Yellow identity card */}
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: '#FFD700',
              color: '#0D0D0D',
              border: '2px solid #0D0D0D',
              padding: 18,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Obsidian initial badge */}
              <span
                aria-hidden="true"
                className="inline-flex shrink-0 items-center justify-center rounded-xl font-display font-black"
                style={{
                  width: 56,
                  height: 56,
                  background: '#0D0D0D',
                  color: '#FFD700',
                  fontSize: 24,
                  letterSpacing: '-1px',
                  border: '2px solid #0D0D0D',
                }}
              >
                {initial(name)}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className="font-display font-black leading-none break-words"
                  style={{ fontSize: 22, letterSpacing: '-0.5px' }}
                >
                  {name || '—'}
                </p>
                <p
                  className="mt-1.5 font-mono font-semibold opacity-70"
                  style={{ fontSize: 12, direction: 'ltr', letterSpacing: 1 }}
                >
                  {maskPhone(phone)}
                </p>
              </div>
            </div>

            {/* Stats — divider + two columns */}
            {totalVisits !== null ? (
              <div
                className="mt-4 flex items-stretch pt-3"
                style={{ borderTop: '1.5px solid #0D0D0D' }}
              >
                <div className="flex-1">
                  <p
                    className="font-display font-black leading-none"
                    style={{ fontSize: 30, letterSpacing: '-1px' }}
                  >
                    {totalVisits}
                  </p>
                  <p
                    className="mt-1.5 font-sans font-bold uppercase opacity-70"
                    style={{ fontSize: 10, letterSpacing: 1.5 }}
                  >
                    {t('profile.totalVisitsLabel')}
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="mx-3 self-stretch"
                  style={{
                    width: 1.5,
                    background: '#0D0D0D',
                    opacity: 0.3,
                  }}
                />
                <div className="flex-1">
                  <p
                    className="font-display font-black leading-none"
                    style={{ fontSize: 30, letterSpacing: '-1px' }}
                  >
                    {cardsCompleted ?? 0}
                  </p>
                  <p
                    className="mt-1.5 font-sans font-bold uppercase opacity-70"
                    style={{ fontSize: 10, letterSpacing: 1.5 }}
                  >
                    {t('profile.cardsCompletedLabel')}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          {/* Preferences */}
          <section className="mt-6">
            <p
              className="mb-2 px-1 font-sans font-bold uppercase text-obsidian/55"
              style={{ fontSize: 11, letterSpacing: 1.5 }}
            >
              {t('profile.preferencesSection')}
            </p>
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ border: '1.5px solid #0D0D0D' }}
            >
              <InstallAppRow />
              <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0 flex-1">
                  <p
                    className="font-sans font-bold text-obsidian"
                    style={{ fontSize: 15 }}
                  >
                    {t('profile.languageLabel')}
                  </p>
                  <p
                    className="mt-0.5 font-sans font-medium text-obsidian/55"
                    style={{ fontSize: 12 }}
                  >
                    {t('profile.languageHint')}
                  </p>
                </div>
                <LanguageToggle />
              </div>
            </div>
          </section>

          {/* Logout */}
          <div className="mt-6">
            <BrandedButton variant="secondary" fullWidth onClick={onLogout}>
              {t('profile.logoutCta')}
            </BrandedButton>
          </div>

          <p
            className="mt-6 text-center font-mono font-semibold text-obsidian/40"
            style={{ fontSize: 11 }}
          >
            {t('profile.versionLabel', { version: APP_VERSION })}
          </p>
        </PageTransition>
      </main>

      <TabBar />
    </div>
  );
}
