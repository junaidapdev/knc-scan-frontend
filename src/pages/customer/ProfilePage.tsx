import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  LanguageToggle,
  ScreenShell,
} from '@/components/common';
import { TabBar } from '@/components/customer';
import { APP_VERSION } from '@/constants/ui';
import { ROUTES } from '@/constants/routes';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';

function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  const last4 = digits.slice(-4);
  return `•••• •••• ${last4}`;
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

  const onLogout = (): void => {
    auth.logout();
    navigate(ROUTES.CUSTOMER.SCAN, { replace: true });
  };

  return (
    <>
      <ScreenShell
        eyebrow={t('profile.eyebrow')}
        title={t('profile.title')}
        description={t('profile.description')}
        showLanguageToggle={false}
      >
        {/* Identity card */}
        <div className="rounded-2xl border-hairline border-obsidian/10 bg-white p-5 shadow-[0_6px_20px_-14px_rgba(13,13,13,0.2)]">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow text-[28px]"
            >
              👤
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[20px] leading-tight text-obsidian break-words">
                {name || '—'}
              </p>
              <p className="mt-1 font-mono text-[13px] text-obsidian/60">
                {maskPhone(phone)}
              </p>
            </div>
          </div>

          {totalVisits !== null ? (
            <div className="mt-4 border-t-hairline border-obsidian/10 pt-4">
              <p className="eyebrow text-obsidian/60">
                {t('profile.totalVisitsLabel')}
              </p>
              <p className="mt-1 font-display text-[22px] leading-none text-obsidian">
                {totalVisits}
              </p>
            </div>
          ) : null}
        </div>

        {/* Settings */}
        <section className="mt-6">
          <p className="eyebrow text-obsidian/60">
            {t('profile.settingsSection')}
          </p>
          <div className="mt-3 rounded-xl border-hairline border-obsidian/10 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-sans text-[14px] font-semibold text-obsidian">
                  {t('profile.languageLabel')}
                </p>
                <p className="mt-1 font-sans text-[12px] text-obsidian/60">
                  {t('profile.languageHint')}
                </p>
              </div>
              <LanguageToggle />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="mt-6">
          <BrandedButton variant="secondary" fullWidth onClick={onLogout}>
            {t('profile.logoutCta')}
          </BrandedButton>
        </section>

        <p className="mt-6 text-center font-mono text-[11px] text-obsidian/40">
          {t('profile.versionLabel', { version: APP_VERSION })}
        </p>

        <div className="h-24" />
      </ScreenShell>
      <TabBar />
    </>
  );
}
