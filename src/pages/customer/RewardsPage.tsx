import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import {
  ErrorFallback,
  KSLogoMark,
  LanguageToggle,
  LoadingSkeleton,
  PageTransition,
} from '@/components/common';
import { RewardCard, TabBar } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { useMyRewards } from '@/hooks/useMyRewards';
import type { IssuedReward, IssuedRewardStatus } from '@/interfaces/reward';

const STATUS_ORDER: Record<IssuedRewardStatus, number> = {
  pending: 0,
  redeemed: 1,
  expired: 2,
};

function formatDate(iso: string | null | undefined, lang: string): string {
  if (!iso) return '';
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '';
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(
      new Date(ms),
    );
  } catch {
    return '';
  }
}

interface ShellProps {
  children: React.ReactNode;
}
function Shell({ children }: ShellProps): JSX.Element {
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
        <PageTransition>{children}</PageTransition>
      </main>
      <TabBar />
    </div>
  );
}

function CountBadge({ value }: { value: number }): JSX.Element {
  return (
    <span
      className="inline-flex items-center rounded font-sans font-bold text-obsidian"
      style={{
        background: '#FFD700',
        padding: '2px 8px',
        fontSize: 11,
        letterSpacing: 0.5,
        minWidth: 22,
        justifyContent: 'center',
      }}
    >
      {value}
    </span>
  );
}

function SectionHeading({
  label,
  count,
}: {
  label: string;
  count: number;
}): JSX.Element {
  return (
    <div className="mb-3 flex items-center gap-3">
      <h2
        className="font-display font-black text-obsidian"
        style={{ fontSize: 18, letterSpacing: '-0.4px' }}
      >
        {label}
      </h2>
      <CountBadge value={count} />
    </div>
  );
}

export default function RewardsPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const { state: rewardsState, reload: reloadRewards } = useMyRewards();
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';
  const reduceMotion = useReducedMotion();

  const { available, history } = useMemo(() => {
    if (rewardsState.status !== 'ready') {
      return {
        available: [] as IssuedReward[],
        history: [] as IssuedReward[],
      };
    }
    const sorted = [...rewardsState.rewards].sort(
      (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
    );
    return {
      available: sorted.filter((r) => r.status === 'pending'),
      history: sorted.filter((r) => r.status !== 'pending'),
    };
  }, [rewardsState]);

  const openClaim = (reward: IssuedReward): void => {
    navigate(ROUTES.CUSTOMER.REWARD_CLAIM(reward.unique_code), {
      state: { reward },
    });
  };

  // Big page heading shared across states.
  const heading = (
    <h1
      className="mb-4 font-display font-black text-obsidian"
      style={{ fontSize: 40, lineHeight: 0.95, letterSpacing: '-1.2px' }}
    >
      {t('rewards.headline')}
    </h1>
  );

  if (rewardsState.status === 'loading') {
    return (
      <Shell>
        {heading}
        <LoadingSkeleton className="h-24 w-full rounded-2xl" />
        <div className="h-3" />
        <LoadingSkeleton className="h-32 w-full rounded-2xl" />
      </Shell>
    );
  }

  if (rewardsState.status === 'error') {
    return (
      <Shell>
        {heading}
        <ErrorFallback onRetry={reloadRewards} />
      </Shell>
    );
  }

  return (
    <Shell>
      {heading}

      {/* Rate us card */}
      <a
        href="#"
        role="button"
        className="mb-6 flex items-center gap-3 rounded-2xl transition-colors hover:bg-yellow focus:outline-none focus-visible:shadow-focus-yellow"
        style={{
          background: '#FFF8D6',
          border: '1.5px solid #0D0D0D',
          padding: '12px 14px',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center rounded-lg font-display font-black text-obsidian"
          style={{
            width: 42,
            height: 42,
            background: '#FFD700',
            border: '1.5px solid #0D0D0D',
            fontSize: 20,
          }}
        >
          ★
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="block font-display font-extrabold text-obsidian"
            style={{ fontSize: 14 }}
          >
            {t('rewards.rateUs.title')}
          </span>
          <span
            className="mt-0.5 block font-sans font-medium text-obsidian/65"
            style={{ fontSize: 12 }}
          >
            {t('rewards.rateUs.subtitle')}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="font-display font-black text-obsidian"
          style={{ fontSize: 16 }}
        >
          {lang === 'ar' ? '←' : '→'}
        </span>
      </a>

      {/* Available */}
      <section>
        <SectionHeading
          label={t('rewards.availableSection')}
          count={available.length}
        />
        {available.length === 0 ? (
          <div
            className="rounded-2xl bg-white text-center"
            style={{
              padding: '24px 16px',
              border: '1.5px dashed #0D0D0D',
            }}
          >
            <p
              className="font-display font-extrabold text-obsidian"
              style={{ fontSize: 17 }}
            >
              {t('rewards.emptyAvailableTitle')}
            </p>
            <p
              className="mt-1 font-sans font-medium text-obsidian/65"
              style={{ fontSize: 13, lineHeight: 1.45 }}
            >
              {t('rewards.emptyAvailable')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {available.map((reward, idx) => (
              <motion.div
                key={reward.id}
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                transition={{ delay: 0.05 + idx * 0.05, duration: 0.25 }}
              >
                <RewardCard
                  reward={reward}
                  language={lang}
                  statusLabel={t('rewards.statusPending')}
                  metaLabel={t('rewards.expiresOn', {
                    date: formatDate(reward.expires_at, i18n.language),
                  })}
                  claimCtaLabel={t('rewards.claimCtaShort')}
                  onClick={openClaim}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* History */}
      <section className="mt-8">
        <SectionHeading
          label={t('rewards.historySection')}
          count={history.length}
        />
        {history.length === 0 ? (
          <p
            className="font-sans font-medium text-obsidian/55"
            style={{ fontSize: 13 }}
          >
            {t('rewards.emptyHistory')}
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((reward, idx) => (
              <motion.div
                key={reward.id}
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                }
                animate={
                  reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                transition={{ delay: 0.05 + idx * 0.05, duration: 0.25 }}
              >
                <RewardCard
                  reward={reward}
                  language={lang}
                  statusLabel={
                    reward.status === 'redeemed'
                      ? t('rewards.statusRedeemed')
                      : t('rewards.statusExpired')
                  }
                  metaLabel={
                    reward.status === 'redeemed' && reward.redeemed_at
                      ? t('rewards.redeemedOn', {
                          date: formatDate(reward.redeemed_at, i18n.language),
                        })
                      : t('rewards.expiresOn', {
                          date: formatDate(reward.expires_at, i18n.language),
                        })
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
