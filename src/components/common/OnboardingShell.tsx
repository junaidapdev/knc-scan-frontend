import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import KayanLogo from './KayanLogo';
import LanguageToggle from './LanguageToggle';
import MarkerSwatch from './MarkerSwatch';
import PageTransition from './PageTransition';

export interface OnboardingShellProps {
  /** Optional back-button click handler. If provided, renders a back chevron above the step badge. */
  onBack?: () => void;
  /** Obsidian step pill text — e.g. "STEP 01 / 03" or "ALMOST THERE". */
  stepLabel?: string;
  /** Headline first part (plain). */
  headlinePre?: string;
  /** Headline highlighted phrase wrapped in MarkerSwatch. */
  headlineMark?: string;
  /** Optional second-line break before the marker phrase. */
  headlineBreak?: boolean;
  /** Optional descriptive paragraph under the headline. */
  description?: ReactNode;
  /** Main content below the headline. */
  children?: ReactNode;
  /** Sticky-bottom button area (or null for none). */
  footer?: ReactNode;
  /** When true, the shell main becomes scrollable (for tall forms). */
  scrollable?: boolean;
}

/**
 * Shared shell for v2 onboarding flow screens.
 * Header: Kayan logo (start) + language toggle (end).
 * Optional back chevron above an obsidian "STEP" pill.
 * Big editorial headline with a yellow MarkerSwatch on a keyword.
 * Body content + bottom-stuck button area.
 */
export default function OnboardingShell({
  onBack,
  stepLabel,
  headlinePre,
  headlineMark,
  headlineBreak = true,
  description,
  children,
  footer,
  scrollable = false,
}: OnboardingShellProps): JSX.Element {
  const { t, i18n } = useTranslation('common');
  const isRtl = i18n.dir() === 'rtl';

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
        <KayanLogo height={44} />
        <LanguageToggle />
      </header>

      <main
        id="main"
        className={[
          'mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-2 pb-6',
          scrollable ? 'overflow-y-auto' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <PageTransition>
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={t('actions.back')}
              className="mb-3 -ms-1 inline-flex items-center gap-1.5 self-start rounded-full font-sans font-bold text-obsidian transition-colors hover:bg-obsidian/5 focus:outline-none focus-visible:shadow-focus-yellow"
              style={{ padding: '6px 10px', fontSize: 13 }}
            >
              <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>
                {isRtl ? '→' : '←'}
              </span>
              {t('actions.back')}
            </button>
          ) : null}

          {stepLabel ? (
            <span
              className="inline-flex self-start font-sans font-bold uppercase"
              style={{
                background: '#0D0D0D',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                letterSpacing: 1.8,
              }}
            >
              {stepLabel}
            </span>
          ) : null}

          {headlinePre || headlineMark ? (
            <h1
              className="font-display font-black text-obsidian"
              style={{
                fontSize: 38,
                lineHeight: 0.95,
                letterSpacing: '-1.5px',
                marginTop: stepLabel ? 14 : 0,
                marginBottom: description ? 12 : 20,
              }}
            >
              {headlinePre}
              {headlineMark ? (
                <>
                  {headlineBreak ? <br /> : ' '}
                  <MarkerSwatch>{headlineMark}</MarkerSwatch>
                </>
              ) : null}
            </h1>
          ) : null}

          {description ? (
            <p
              className="font-sans font-medium text-obsidian/65"
              style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}
            >
              {description}
            </p>
          ) : null}

          {children}
        </PageTransition>

        {footer ? <div className="mt-auto pt-6">{footer}</div> : null}
      </main>
    </div>
  );
}
