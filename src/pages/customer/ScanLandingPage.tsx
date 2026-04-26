import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  KayanLogo,
  KSLogoMark,
  LanguageToggle,
  PageTransition,
} from '@/components/common';
import { motion, useReducedMotion } from 'framer-motion';
import { ScanInstructionsSheet } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import { branchCity, branchName } from '@/lib/branch';
import { useBranches } from '@/hooks/useBranches';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';

const QR_QUERY_PARAM = 'b';

interface ShellProps {
  children: React.ReactNode;
}
function Shell({ children }: ShellProps): JSX.Element {
  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      <header
        className="flex items-center justify-between px-5"
        style={{
          height: 60,
          borderBottom: '1px solid rgba(13,13,13,0.06)',
        }}
      >
        <KayanLogo height={44} />
        <LanguageToggle />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-2 pb-6">
        <PageTransition className="flex flex-1 flex-col">
          {children}
        </PageTransition>
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
  // The Kayan brand logo is black-on-yellow native, so it can only sit on a
  // yellow ground. On the obsidian "invalid" state we fall back to the
  // smaller ١٠ brand mark in inverted colors.
  const showFullLogo = state.bg === '#FFD700';

  return (
    <div
      className="relative flex flex-1 flex-col overflow-hidden rounded-3xl"
      style={{
        padding: 24,
        background: state.bg,
        color: state.fg,
        border: '2px solid #0D0D0D',
        minHeight: 360,
      }}
    >
      {/* Status pill — top */}
      <span
        className="inline-flex items-center gap-2 self-start font-sans font-bold uppercase"
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

      {/* Brand logo — wrapped in a dashed "stamp window" so it has presence
          on the big yellow card instead of floating in empty space. Echoes
          the same dashed-perforation language used between sections. */}
      <div className="flex flex-1 items-center justify-center py-4">
        {showFullLogo ? (
          <div
            className="flex flex-col items-center gap-3"
            style={{
              padding: '24px 32px',
              borderRadius: 16,
              border: '1.5px dashed rgba(13,13,13,0.35)',
              maxWidth: '85%',
            }}
          >
            <KayanLogo height={160} className="select-none" />
          </div>
        ) : (
          <KSLogoMark size={88} />
        )}
      </div>

      {/* Headline + body */}
      <div>
        <h1
          className="font-display font-black"
          style={{
            fontSize: 36,
            lineHeight: 0.95,
            letterSpacing: '-1.2px',
            margin: 0,
            maxWidth: 280,
          }}
        >
          {state.title}
        </h1>
        <p
          className="font-sans font-medium"
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.5,
            maxWidth: 320,
            color:
              state.fg === '#FFD700'
                ? 'rgba(255,215,0,0.85)'
                : 'rgba(13,13,13,0.78)',
          }}
        >
          {state.body}
        </p>

        {branchName ? (
          <>
            {/* Dashed perforation — boarding-pass divider */}
            <div
              aria-hidden="true"
              className="my-4"
              style={{
                height: 0,
                borderTop: '1.5px dashed #0D0D0D',
                opacity: 0.4,
              }}
            />

            {/* Branch tile */}
            <div
              className="flex items-center justify-between gap-3 rounded-xl"
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
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Branded loading hero — mirrors HeroCard's layout so the transition into
 * the loaded state feels seamless. Shows a pulsing yellow dot in the pill,
 * a breathing Kayan logo, and animated trailing dots after the headline.
 */
function HeroCardLoading(): JSX.Element {
  const { t } = useTranslation('customer');
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="relative flex flex-1 flex-col overflow-hidden rounded-3xl"
      style={{
        padding: 24,
        background: '#FFD700',
        color: '#0D0D0D',
        border: '2px solid #0D0D0D',
        minHeight: 360,
      }}
    >
      {/* Loading pill */}
      <span
        className="inline-flex items-center gap-2 self-start font-sans font-bold uppercase"
        style={{
          padding: '5px 11px',
          borderRadius: 4,
          background: '#0D0D0D',
          color: '#FFD700',
          fontSize: 10,
          letterSpacing: 1.8,
        }}
      >
        <motion.span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: '#FFD700',
            display: 'inline-block',
          }}
          animate={
            reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {t('scan.loadingPill')}
      </span>

      {/* Breathing Kayan logo — same dashed window as the loaded state so
          the transition feels seamless. */}
      <div className="flex flex-1 items-center justify-center py-4">
        <motion.div
          className="flex flex-col items-center gap-3"
          style={{
            padding: '24px 32px',
            borderRadius: 16,
            border: '1.5px dashed rgba(13,13,13,0.35)',
            maxWidth: '85%',
          }}
          animate={
            reduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }
          }
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <KayanLogo height={160} className="select-none" />
        </motion.div>
      </div>

      {/* Headline + animated dots */}
      <div>
        <h1
          className="flex items-baseline gap-1 font-display font-black"
          style={{
            fontSize: 36,
            lineHeight: 0.95,
            letterSpacing: '-1.2px',
            margin: 0,
          }}
        >
          {t('scan.loadingHeadline')}
          {!reduceMotion ? (
            <span
              aria-hidden="true"
              className="inline-flex gap-0.5"
              style={{ fontSize: 36, letterSpacing: '-1.2px' }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                >
                  .
                </motion.span>
              ))}
            </span>
          ) : (
            '...'
          )}
        </h1>
        <p
          className="font-sans font-medium"
          style={{
            marginTop: 12,
            fontSize: 14,
            lineHeight: 1.5,
            color: 'rgba(13,13,13,0.78)',
            maxWidth: 320,
          }}
        >
          {t('scan.loadingBody')}
        </p>
      </div>
    </div>
  );
}

export default function ScanLandingPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qrIdentifier = params.get(QR_QUERY_PARAM);
  const { state, reload } = useBranches();
  const auth = useCustomerAuth();
  const [howToOpen, setHowToOpen] = useState<boolean>(false);
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';

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
        <HeroCardLoading />
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
    };
    return (
      <Shell>
        <HeroCard state={heroState} />
        <div className="mt-3 flex flex-col gap-2">
          <BrandedButton
            fullWidth
            onClick={() => setHowToOpen(true)}
          >
            {t('scan.welcome.scanCta')}
          </BrandedButton>
          {auth.session ? (
            <BrandedButton
              variant="secondary"
              fullWidth
              onClick={() => navigate(ROUTES.CUSTOMER.HOME)}
            >
              {t('scan.welcome.viewCardCta')}
            </BrandedButton>
          ) : null}
        </div>
        <ScanInstructionsSheet
          open={howToOpen}
          onClose={() => setHowToOpen(false)}
        />
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
        branchName={branchName(branch, lang)}
        branchCity={branchCity(branch, lang)}
      />
      <div className="mt-3 flex flex-col gap-2">
        <BrandedButton fullWidth onClick={handleContinue}>
          {t('scan.cta')}
        </BrandedButton>
      </div>
    </Shell>
  );
}
