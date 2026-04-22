import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
} from '@/components/common';
import { RewardCard } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { STAMPS_PER_CARD } from '@/constants/ui';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useMyProfile } from '@/hooks/useMyProfile';
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

function firstName(full: string): string {
  const trimmed = full.trim();
  if (!trimmed) return '';
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

function last4(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-4).padStart(4, '•');
}

interface LoyaltyCardProps {
  name: string;
  phoneLast4: string;
  current: number;
  max: number;
  eyebrow: string;
  countLabel: string;
}

function LoyaltyCard({
  name,
  phoneLast4,
  current,
  max,
  eyebrow,
  countLabel,
}: LoyaltyCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const cells = Array.from({ length: max }, (_, i) => i);
  const newestFilledIndex = current > 0 ? current - 1 : -1;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-yellow p-5 text-obsidian shadow-[0_10px_30px_-8px_rgba(13,13,13,0.25)]">
      {/* Subtle shimmer overlay */}
      {!reduceMotion ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            backgroundSize: '250% 100%',
          }}
          animate={{ backgroundPositionX: ['150%', '-50%'] }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-obsidian/70">{eyebrow}</p>
          <p className="mt-2 font-display text-[32px] leading-none tracking-display">
            {countLabel}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-hover text-[22px] shadow-inner"
        >
          ⭐️
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-5 gap-2">
        {cells.map((i) => {
          const filled = i < current;
          const isNewest = i === newestFilledIndex;
          return (
            <motion.div
              key={i}
              initial={
                isNewest && !reduceMotion
                  ? { scale: 0.6, opacity: 0.4 }
                  : false
              }
              animate={
                isNewest && !reduceMotion
                  ? { scale: [1, 1.15, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={[
                'aspect-square rounded-lg flex items-center justify-center',
                filled
                  ? 'bg-transparent'
                  : 'border-2 border-dashed border-obsidian/25',
              ].join(' ')}
            >
              {filled ? (
                <span className="flex h-full w-full items-center justify-center rounded-lg bg-obsidian text-[20px] leading-none">
                  🍬
                </span>
              ) : (
                <span className="font-display text-[16px] text-obsidian/40">
                  {i + 1}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <p className="font-display text-[14px] uppercase leading-none tracking-[2px] text-obsidian">
          {name || '•••'}
        </p>
        <p className="font-mono text-[13px] text-obsidian/80">
          •••• {phoneLast4}
        </p>
      </div>
    </div>
  );
}

export default function RewardsPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const auth = useCustomerAuth();
  const { state: rewardsState, reload: reloadRewards } = useMyRewards();
  const { state: profileState } = useMyProfile();
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

  const currentStamps =
    profileState.status === 'ready'
      ? profileState.profile.current_stamps
      : null;

  const customerName =
    (profileState.status === 'ready' ? profileState.profile.name : null) ??
    auth.session?.customer.name ??
    '';
  const customerPhone = auth.session?.customer.phone ?? '';

  const openClaim = (reward: IssuedReward): void => {
    navigate(ROUTES.CUSTOMER.REWARD_CLAIM(reward.unique_code), {
      state: { reward },
    });
  };

  if (rewardsState.status === 'loading') {
    return (
      <ScreenShell
        eyebrow={t('rewards.eyebrow')}
        title={t('rewards.title')}
        description={t('rewards.description')}
      >
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="mt-4 h-24 w-full" />
      </ScreenShell>
    );
  }

  if (rewardsState.status === 'error') {
    return (
      <ScreenShell
        eyebrow={t('rewards.eyebrow')}
        title={t('rewards.title')}
      >
        <ErrorFallback onRetry={reloadRewards} />
      </ScreenShell>
    );
  }

  const stampsNow = currentStamps ?? 0;
  const remaining = Math.max(STAMPS_PER_CARD - stampsNow, 0);
  const cardFull = stampsNow >= STAMPS_PER_CARD;
  const hasPendingReward = available.length > 0;

  return (
    <ScreenShell
      eyebrow={t('rewards.eyebrow')}
      title={t('rewards.welcome', {
        name: firstName(customerName) || t('rewards.title'),
      })}
      description={t('rewards.description')}
    >
      {/* Loyalty card */}
      <section>
        <LoyaltyCard
          name={customerName.toUpperCase()}
          phoneLast4={last4(customerPhone)}
          current={stampsNow}
          max={STAMPS_PER_CARD}
          eyebrow={t('rewards.cardTitle')}
          countLabel={t('rewards.cardCountLabel', {
            current: stampsNow,
            max: STAMPS_PER_CARD,
          })}
        />
        <p className="mt-3 font-sans text-[14px] text-obsidian">
          {hasPendingReward
            ? t('rewards.rewardReadyBelow')
            : cardFull
              ? t('rewards.rewardReady')
              : t('rewards.moreStampsUntilReward', { count: remaining })}
        </p>
      </section>

      {/* Rate us card — link is per-branch; real URL wired later via google_review_url */}
      <section className="mt-6">
        <a
          href="#"
          role="button"
          className="flex items-center gap-4 rounded-xl border-[1.5px] border-yellow bg-yellow-tint p-4 transition-colors hover:bg-yellow focus:outline-none focus-visible:shadow-focus-yellow"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow text-[24px]"
          >
            ⭐️
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[18px] leading-tight tracking-[2px] text-obsidian">
              {t('rewards.rateUs.title')}
            </span>
            <span className="mt-1 block font-sans text-[12px] leading-snug text-obsidian/70">
              {t('rewards.rateUs.subtitle')}
            </span>
          </span>
          <span className="font-display text-[20px] text-obsidian">→</span>
        </a>
      </section>

      {/* Available */}
      <section className="mt-8">
        <p className="eyebrow text-obsidian/60">
          {t('rewards.availableSection')}
        </p>
        <div className="mt-2 space-y-3">
          {available.length === 0 ? (
            <p className="font-sans text-[13px] text-obsidian/60">
              {t('rewards.emptyAvailable')}
            </p>
          ) : (
            available.map((reward, idx) => (
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
                  claimCtaLabel={t('rewards.claimCta')}
                  onClick={openClaim}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* History */}
      <section className="mt-6">
        <p className="eyebrow text-obsidian/60">
          {t('rewards.historySection')}
        </p>
        <div className="mt-2 space-y-3">
          {history.length === 0 ? (
            <p className="font-sans text-[13px] text-obsidian/60">
              {t('rewards.emptyHistory')}
            </p>
          ) : (
            history.map((reward, idx) => (
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
            ))
          )}
        </div>
      </section>

      {auth.session ? (
        <div className="mt-8">
          <BrandedButton
            variant="secondary"
            fullWidth
            onClick={() => navigate(ROUTES.CUSTOMER.SCAN)}
          >
            {t('stampSuccess.done')}
          </BrandedButton>
        </div>
      ) : null}
    </ScreenShell>
  );
}
