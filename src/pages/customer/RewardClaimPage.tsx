import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  KayanLogo,
  LanguageToggle,
  LoadingSkeleton,
  PageTransition,
} from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { useBranches } from '@/hooks/useBranches';
import { useMyRewards } from '@/hooks/useMyRewards';
import { claimRewardStep1 } from '@/lib/services';
import type { IssuedReward } from '@/interfaces/reward';
import type { Branch } from '@/interfaces/branch';

interface LocationState {
  reward?: IssuedReward;
}

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
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <KayanLogo height={34} />
        <LanguageToggle />
      </header>
      <main
        id="main"
        className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-12 pt-4"
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}

interface BranchRadioProps {
  branch: Branch;
  selected: boolean;
  onSelect: (id: string) => void;
}
function BranchRadio({
  branch,
  selected,
  onSelect,
}: BranchRadioProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onSelect(branch.id)}
      className="flex w-full items-center justify-between rounded-xl text-start transition-colors duration-150 focus:outline-none focus-visible:shadow-focus-yellow"
      style={{
        padding: '14px 16px',
        background: selected ? '#FFD700' : '#FFFFFF',
        border: '1.5px solid #0D0D0D',
      }}
      aria-pressed={selected}
    >
      <div className="min-w-0 flex-1">
        <p
          className="font-display font-extrabold text-obsidian"
          style={{ fontSize: 14, letterSpacing: '-0.2px' }}
        >
          {branch.name}
        </p>
        <p
          className="mt-0.5 font-sans font-medium"
          style={{
            fontSize: 12,
            color: selected ? '#4A4A4A' : '#8A8A87',
          }}
        >
          {branch.city}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="inline-flex shrink-0 items-center justify-center"
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: '1.5px solid #0D0D0D',
          background: selected ? '#0D0D0D' : 'transparent',
          color: '#FFD700',
          fontSize: 13,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}

export default function RewardClaimPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ code: string }>();
  const code = params.code ?? '';
  const stateParams = (location.state ?? {}) as LocationState;
  const { state: branchesState, reload } = useBranches();
  const { state: rewardsState } = useMyRewards();
  const toastError = useApiErrorToast();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';

  const reward: IssuedReward | null = useMemo(() => {
    if (stateParams.reward) return stateParams.reward;
    if (rewardsState.status !== 'ready') return null;
    return rewardsState.rewards.find((r) => r.unique_code === code) ?? null;
  }, [stateParams.reward, rewardsState, code]);

  const branch =
    branchesState.status === 'ready'
      ? (branchesState.branches.find((b) => b.id === selectedBranchId) ?? null)
      : null;

  const onStartRedemption = async (): Promise<void> => {
    if (!reward || !branch) return;
    setSubmitting(true);
    try {
      const confirmation = await claimRewardStep1(reward.unique_code, {
        branch_qr_identifier: branch.qr_identifier,
      });
      navigate(ROUTES.CUSTOMER.REWARD_CONFIRM(reward.unique_code), {
        state: {
          confirmation,
          branchQrIdentifier: branch.qr_identifier,
          reward,
        },
      });
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (rewardsState.status === 'loading' || branchesState.status === 'loading') {
    return (
      <Shell>
        <LoadingSkeleton className="h-56 w-full rounded-2xl" />
        <div className="h-3" />
        <LoadingSkeleton className="h-14 w-full rounded-xl" />
      </Shell>
    );
  }

  if (rewardsState.status === 'error' || branchesState.status === 'error') {
    return (
      <Shell>
        <ErrorFallback onRetry={reload} />
      </Shell>
    );
  }

  if (!reward) {
    return (
      <Shell>
        <h1
          className="font-display font-black text-obsidian"
          style={{ fontSize: 28, letterSpacing: '-0.8px', lineHeight: 1 }}
        >
          {t('rewardClaim.title')}
        </h1>
        <p className="mt-3 font-sans font-medium text-obsidian/65">
          {t('rewardClaim.notFound')}
        </p>
        <div className="mt-6">
          <BrandedButton
            variant="secondary"
            fullWidth
            onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
          >
            {t('rewardDone.cta')}
          </BrandedButton>
        </div>
      </Shell>
    );
  }

  const name =
    lang === 'ar' && reward.reward_name_snapshot_ar
      ? reward.reward_name_snapshot_ar
      : reward.reward_name_snapshot;
  const description =
    lang === 'ar' && reward.reward_description_snapshot_ar
      ? reward.reward_description_snapshot_ar
      : reward.reward_description_snapshot;

  return (
    <Shell>
      {/* Yellow reward hero */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          padding: 22,
          background: '#FFD700',
          color: '#0D0D0D',
          border: '2px solid #0D0D0D',
        }}
      >
        <p
          className="font-sans font-bold uppercase"
          style={{ fontSize: 10, letterSpacing: 1.8 }}
        >
          {t('rewardClaim.eyebrow')}
        </p>
        <p
          className="mt-1.5 font-display font-black break-words"
          style={{ fontSize: 30, lineHeight: 1, letterSpacing: '-1px' }}
        >
          {name}
        </p>
        {description ? (
          <p
            className="mt-1 font-sans font-medium opacity-75"
            style={{ fontSize: 13 }}
          >
            {description}
          </p>
        ) : null}

        {/* Obsidian code box */}
        <div
          className="mt-5 rounded-xl text-center"
          style={{
            background: '#0D0D0D',
            color: '#FFD700',
            padding: 16,
          }}
        >
          <p
            className="font-sans font-bold uppercase opacity-70"
            style={{ fontSize: 10, letterSpacing: 1.8 }}
          >
            {t('rewardClaim.codeLabel')}
          </p>
          <p
            className="mt-2 font-mono font-bold"
            style={{
              fontSize: 26,
              letterSpacing: 3,
              direction: 'ltr',
              wordBreak: 'break-all',
            }}
          >
            {reward.unique_code}
          </p>
          <p
            className="mt-1.5 font-sans font-semibold opacity-65"
            style={{ fontSize: 11, direction: 'ltr' }}
          >
            {t('rewardClaim.expiresLabel', {
              date: formatDate(reward.expires_at, i18n.language),
            })}
          </p>
        </div>
      </div>

      {/* Show-cashier hint */}
      <div
        className="mt-3 flex items-center gap-2 rounded-lg"
        style={{
          padding: '10px 14px',
          background: '#FFF8D6',
          border: '1px solid #0D0D0D',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center font-display font-black"
          style={{
            background: '#0D0D0D',
            color: '#FFD700',
            padding: '2px 6px',
            borderRadius: 3,
            fontSize: 9,
            letterSpacing: 0.5,
          }}
        >
          !
        </span>
        <p
          className="font-sans font-semibold text-obsidian"
          style={{ fontSize: 12 }}
        >
          {t('rewardClaim.showToCashier')}
        </p>
      </div>

      {/* Branch radio list */}
      <div className="mt-6">
        <p
          className="mb-2 font-sans font-bold uppercase text-obsidian/65"
          style={{ fontSize: 11, letterSpacing: 1.4 }}
        >
          {t('rewardClaim.selectBranchLabel')}
        </p>
        <div className="space-y-2">
          {branchesState.branches.map((b) => (
            <BranchRadio
              key={b.id}
              branch={b}
              selected={selectedBranchId === b.id}
              onSelect={setSelectedBranchId}
            />
          ))}
        </div>
        <p
          className="mt-2 font-sans font-medium text-obsidian/55"
          style={{ fontSize: 12 }}
        >
          {t('rewardClaim.selectBranchHint')}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <BrandedButton
          fullWidth
          disabled={!selectedBranchId}
          loading={submitting}
          onClick={onStartRedemption}
        >
          {t('rewardClaim.cta')}
        </BrandedButton>
      </div>
    </Shell>
  );
}
