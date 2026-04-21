import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
import { ROUTES } from '@/constants/routes';

interface LocationState {
  nextEligibleAt?: string;
}

function formatWhen(iso: string | undefined, lang: string): string | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  try {
    return new Intl.DateTimeFormat(lang, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ms));
  } catch {
    return null;
  }
}

/**
 * Friendly lockout screen shown when /visits/scan returns SCAN_LOCKOUT_ACTIVE.
 * Public — no guard — so the user can always find their way back.
 */
export default function LockoutPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;

  const when =
    formatWhen(stateParams.nextEligibleAt, i18n.language) ??
    t('lockout.whenShortly');

  return (
    <ScreenShell
      eyebrow={t('lockout.eyebrow')}
      title={t('lockout.title')}
      description={t('lockout.description', { when })}
    >
      <BrandedButton
        variant="secondary"
        fullWidth
        onClick={() => navigate(ROUTES.CUSTOMER.SCAN)}
      >
        {t('lockout.cta')}
      </BrandedButton>
    </ScreenShell>
  );
}
