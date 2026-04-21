import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  BrandedButton,
  ErrorFallback,
  LoadingSkeleton,
  ScreenShell,
} from '@/components/common';
import { BranchSelect } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { useBranches } from '@/hooks/useBranches';
import { useMyRewards } from '@/hooks/useMyRewards';
import { claimRewardStep1 } from '@/lib/services';
import type { IssuedReward } from '@/interfaces/reward';

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
      ? branchesState.branches.find((b) => b.id === selectedBranchId) ?? null
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
      <ScreenShell
        eyebrow={t('rewardClaim.eyebrow')}
        title={t('rewardClaim.title')}
      >
        <LoadingSkeleton className="h-14 w-full" />
      </ScreenShell>
    );
  }

  if (rewardsState.status === 'error' || branchesState.status === 'error') {
    return (
      <ScreenShell
        eyebrow={t('rewardClaim.eyebrow')}
        title={t('rewardClaim.title')}
      >
        <ErrorFallback onRetry={reload} />
      </ScreenShell>
    );
  }

  if (!reward) {
    return (
      <ScreenShell
        eyebrow={t('rewardClaim.eyebrow')}
        title={t('rewardClaim.title')}
        description={t('rewardClaim.notFound')}
      >
        <BrandedButton
          variant="secondary"
          fullWidth
          onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
        >
          {t('rewardDone.cta')}
        </BrandedButton>
      </ScreenShell>
    );
  }

  const name =
    lang === 'ar' && reward.reward_name_snapshot_ar
      ? reward.reward_name_snapshot_ar
      : reward.reward_name_snapshot;

  return (
    <ScreenShell
      eyebrow={t('rewardClaim.eyebrow')}
      title={t('rewardClaim.title')}
      description={t('rewardClaim.showToCashier')}
    >
      <div className="relative overflow-hidden rounded-2xl border-hairline border-obsidian/10 bg-white p-5 shadow-[0_10px_30px_-14px_rgba(13,13,13,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-[24px] leading-tight text-obsidian">
            {name}
          </p>
          <span className="shrink-0 rounded-full bg-yellow px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[2px] text-obsidian">
            {t('rewardClaim.readyBadge')}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-center rounded-xl bg-yellow-tint py-8">
          <span aria-hidden="true" className="text-[72px] leading-none">
            🎁
          </span>
        </div>

        <p className="mt-5 eyebrow text-obsidian/60">
          {t('rewardClaim.codeLabel')}
        </p>
        <div className="mt-2 rounded-lg border-2 border-dashed border-obsidian/25 px-4 py-3 text-center">
          <p className="font-mono text-[22px] tracking-[6px] text-obsidian">
            {reward.unique_code}
          </p>
        </div>
        <p className="mt-3 font-sans text-[12px] text-obsidian/60">
          {t('rewardClaim.expiresLabel', {
            date: formatDate(reward.expires_at, i18n.language),
          })}
        </p>
      </div>

      <div className="mt-6">
        <BranchSelect
          label={t('registerDetails.preferredBranchLabel')}
          placeholder={t('registerDetails.preferredBranchLabel')}
          branches={branchesState.branches}
          value={selectedBranchId}
          onChange={(e) => setSelectedBranchId(e.target.value)}
        />
      </div>

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
    </ScreenShell>
  );
}
