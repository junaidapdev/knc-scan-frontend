import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
} from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import { useBranches } from '@/hooks/useBranches';

const QR_QUERY_PARAM = 'b';

export default function ScanLandingPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qrIdentifier = params.get(QR_QUERY_PARAM);
  const { state, reload } = useBranches();

  const branch = useMemo(() => {
    if (state.status !== 'ready' || !qrIdentifier) return null;
    return state.branches.find(
      (b) => b.qr_identifier === qrIdentifier && b.active,
    );
  }, [state, qrIdentifier]);

  useEffect(() => {
    if (branch) track(ANALYTICS_EVENTS.SCAN_STARTED, { branchId: branch.id });
  }, [branch]);

  if (state.status === 'loading') {
    return (
      <ScreenShell
        eyebrow={t('scan.eyebrow')}
        title={t('scan.title')}
        description={t('scan.loading')}
      >
        <LoadingSkeleton className="h-14 w-full" />
      </ScreenShell>
    );
  }

  if (state.status === 'error') {
    return (
      <ScreenShell eyebrow={t('scan.eyebrow')} title={t('scan.title')}>
        <ErrorFallback onRetry={reload} />
      </ScreenShell>
    );
  }

  if (!qrIdentifier || !branch) {
    return (
      <ScreenShell
        eyebrow={t('scan.eyebrow')}
        title={t('scan.invalid.title')}
        description={t('scan.invalid.body')}
      >
        <BrandedButton
          variant="secondary"
          fullWidth
          onClick={() => window.location.reload()}
        >
          {t('scan.invalid.cta')}
        </BrandedButton>
      </ScreenShell>
    );
  }

  const handleContinue = (): void => {
    navigate(ROUTES.CUSTOMER.PHONE, {
      state: { branchId: branch.id, qrIdentifier: branch.qr_identifier },
    });
  };

  return (
    <ScreenShell
      eyebrow={t('scan.eyebrow')}
      title={t('scan.title')}
      description={t('scan.description')}
    >
      <div className="rounded-lg border-hairline border-obsidian/10 bg-white p-6">
        <p className="eyebrow text-obsidian/60">{t('scan.branchLabel')}</p>
        <p className="mt-2 font-display text-[28px] leading-none text-obsidian">
          {branch.name.toUpperCase()}
        </p>
        <p className="mt-2 font-mono text-[13px] text-obsidian/60">
          {branch.city}
        </p>
      </div>
      <div className="mt-6">
        <BrandedButton fullWidth onClick={handleContinue}>
          {t('scan.cta')}
        </BrandedButton>
      </div>
    </ScreenShell>
  );
}
