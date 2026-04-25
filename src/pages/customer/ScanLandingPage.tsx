import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  KayanLogo,
  KSLogoMark,
  LanguageToggle,
  LoadingSkeleton,
  PageTransition,
} from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import { useBranches } from '@/hooks/useBranches';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

const QR_QUERY_PARAM = 'b';

interface ShellProps {
  children: React.ReactNode;
}
function Shell({ children }: ShellProps): JSX.Element {
  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <KayanLogo height={34} />
        <LanguageToggle />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-2 pb-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

interface HeroState {
  bg: string;
  fg: string;
  pillBg: string;
  pillFg: string;
  pillText: string;
  title: string;
  body: string;
  showWatermark: boolean;
}

function HeroCard({
  state,
  branchName,
  branchCity,
}: {
  state: HeroState;
  branchName?: string;
  branchCity?: string;
}): JSX.Element {
  return (
    <div
      className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-3xl"
      style={{
        padding: 28,
        background: state.bg,
        color: state.fg,
        border: '2px solid #0D0D0D',
        minHeight: 460,
      }}
    >
      {/* ١٠ watermark */}
      {state.showWatermark ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute select-none"
          style={{
            right: -30,
            top: 30,
            bottom: 30,
            width: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Noto Naskh Arabic", system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 280,
            lineHeight: 0.8,
            color: '#0D0D0D',
            opacity: 0.08,
            letterSpacing: -8,
          }}
        >
          ١٠
        </span>
      ) : null}

      <div className="relative">
        <span
          className="inline-flex items-center gap-2 font-sans font-bold uppercase"
          style={{
            padding: '5px 11px',
            borderRadius: 4,
            background: state.pillBg,
            color: state.pillFg,
            fontSize: 10,
            letterSpacing: 1.8,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: state.pillFg,
              display: 'inline-block',
            }}
          />
          {state.pillText}
        </span>
      </div>

      <div className="relative">
        <h1
          className="font-display font-black"
          style={{
            fontSize: 40,
            lineHeight: 0.95,
            letterSpacing: '-1.4px',
            margin: 0,
            maxWidth: 260,
          }}
        >
          {state.title}
        </h1>
        <p
          className="font-sans font-medium"
          style={{
            marginTop: 14,
            fontSize: 14,
            lineHeight: 1.5,
            maxWidth: 280,
            color:
              state.fg === '#FFD700' ? 'rgba(255,215,0,0.85)' : 'rgba(13,13,13,0.78)',
          }}
        >
          {state.body}
        </p>

        {branchName ? (
          <div
            className="mt-5 flex items-center justify-between gap-3 rounded-xl"
            style={{
              padding: '14px 16px',
              background: '#FFFFFF',
              border: '1.5px solid #0D0D0D',
            }}
          >
            <div>
              <p
                className="font-sans font-bold uppercase text-obsidian/55"
                style={{ fontSize: 10, letterSpacing: 1.5 }}
              >
                {/* "You're at" */}
              </p>
              <p
                className="font-display font-black text-obsidian"
                style={{ fontSize: 18, letterSpacing: '-0.4px', marginTop: 2 }}
              >
                {branchName}
              </p>
              {branchCity ? (
                <p
                  className="font-sans font-medium text-obsidian/65"
                  style={{ fontSize: 12 }}
                >
                  {branchCity}
                </p>
              ) : null}
            </div>
            <KSLogoMark size={36} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function ScanLandingPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qrIdentifier = params.get(QR_QUERY_PARAM);
  const { state, reload } = useBranches();
  const auth = useCustomerAuth();

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
      <Shell>
        <LoadingSkeleton className="h-[460px] w-full rounded-3xl" />
      </Shell>
    );
  }

  if (state.status === 'error') {
    return (
      <Shell>
        <ErrorFallback onRetry={reload} />
      </Shell>
    );
  }

  // No code at all → "Welcome back" state (B in design).
  if (!qrIdentifier) {
    const heroState: HeroState = {
      bg: '#FFD700',
      fg: '#0D0D0D',
      pillBg: '#0D0D0D',
      pillFg: '#FFD700',
      pillText: t('scan.welcomePill'),
      title: t('scan.welcome.title'),
      body: t('scan.welcome.body'),
      showWatermark: true,
    };
    return (
      <Shell>
        <HeroCard state={heroState} />
        <div className="mt-3 flex flex-col gap-2">
          {auth.session ? (
            <BrandedButton
              fullWidth
              onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
            >
              {t('scan.welcome.viewRewards')}
            </BrandedButton>
          ) : null}
        </div>
      </Shell>
    );
  }

  // Code provided but didn't match → "QR not recognized" state (C in design).
  if (!branch) {
    const heroState: HeroState = {
      bg: '#0D0D0D',
      fg: '#FFD700',
      pillBg: '#FFD700',
      pillFg: '#0D0D0D',
      pillText: t('scan.invalidPill'),
      title: t('scan.invalid.title'),
      body: t('scan.invalid.body'),
      showWatermark: false,
    };
    return (
      <Shell>
        <HeroCard state={heroState} />
        <div className="mt-3 flex flex-col gap-2">
          <BrandedButton
            variant="secondary"
            fullWidth
            onClick={() => window.location.reload()}
          >
            {t('scan.invalid.cta')}
          </BrandedButton>
        </div>
      </Shell>
    );
  }

  // Branch confirmed → state A.
  const heroState: HeroState = {
    bg: '#FFD700',
    fg: '#0D0D0D',
    pillBg: '#0D0D0D',
    pillFg: '#FFD700',
    pillText: t('scan.confirmedPill'),
    title: t('scan.confirmed.title'),
    body: t('scan.confirmed.body'),
    showWatermark: true,
  };

  const handleContinue = (): void => {
    navigate(ROUTES.CUSTOMER.PHONE, {
      state: { branchId: branch.id, qrIdentifier: branch.qr_identifier },
    });
  };

  return (
    <Shell>
      <HeroCard
        state={heroState}
        branchName={branch.name}
        branchCity={branch.city}
      />
      <div className="mt-3 flex flex-col gap-2">
        <BrandedButton fullWidth onClick={handleContinue}>
          {t('scan.cta')}
        </BrandedButton>
      </div>
    </Shell>
  );
}
