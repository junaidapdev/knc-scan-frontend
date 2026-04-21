import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
import { CountdownPill } from '@/components/customer';
import { ROUTES } from '@/constants/routes';
import { useApiErrorToast } from '@/hooks/useApiErrorToast';
import { claimRewardStep2 } from '@/lib/services';
import { ANALYTICS_EVENTS, track } from '@/lib/analytics';
import type { IssuedReward, RedemptionConfirmation } from '@/interfaces/reward';

interface LocationState {
  confirmation?: RedemptionConfirmation;
  branchQrIdentifier?: string;
  reward?: IssuedReward;
}

export default function RewardConfirmPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const params = useParams<{ code: string }>();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const toastError = useApiErrorToast();
  const [submitting, setSubmitting] = useState<boolean>(false);

  // The step-1 redemption_token lives in memory only — if it's missing,
  // the page was opened directly, so send the user back to start over.
  if (
    !stateParams.confirmation ||
    !stateParams.branchQrIdentifier ||
    !params.code
  ) {
    return <Navigate to={ROUTES.CUSTOMER.REWARDS} replace />;
  }

  const { confirmation, branchQrIdentifier } = stateParams;
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';

  const displayName =
    lang === 'ar' && confirmation.summary.reward_name.ar
      ? confirmation.summary.reward_name.ar
      : confirmation.summary.reward_name.en;

  const onConfirm = async (): Promise<void> => {
    setSubmitting(true);
    try {
      const redeemed = await claimRewardStep2(
        confirmation.summary.unique_code,
        { branch_qr_identifier: branchQrIdentifier },
        confirmation.redemption_token,
      );
      track(ANALYTICS_EVENTS.REWARD_CLAIMED, {
        uniqueCode: redeemed.unique_code,
      });
      navigate(ROUTES.CUSTOMER.REWARD_DONE(redeemed.unique_code), {
        state: { reward: redeemed },
      });
    } catch (err) {
      toastError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = (): void => {
    navigate(ROUTES.CUSTOMER.REWARDS);
  };

  return (
    <ScreenShell
      eyebrow={t('rewardConfirm.eyebrow')}
      title={t('rewardConfirm.title')}
      description={t('rewardConfirm.description')}
    >
      <div className="rounded-lg border-[1.5px] border-yellow bg-yellow-tint p-6">
        <p className="eyebrow text-obsidian/70">
          {t('rewardConfirm.codeLabel')}
        </p>
        <p className="mt-2 font-mono text-[28px] tracking-[4px] text-obsidian">
          {confirmation.summary.unique_code}
        </p>
        <p className="mt-4 font-display text-[20px] leading-tight text-obsidian">
          {displayName}
        </p>
        {confirmation.summary.customer_name ? (
          <p className="mt-1 font-sans text-[13px] text-obsidian/70">
            {t('rewardConfirm.customerLabel')}:{' '}
            {confirmation.summary.customer_name}
          </p>
        ) : null}
        <div className="mt-5">
          <CountdownPill
            expiresAt={confirmation.summary.expires_at}
            label={t('rewardClaim.expiresLabel', { date: '' }).replace(
              /\s*$/,
              '',
            )}
          />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <BrandedButton
          fullWidth
          loading={submitting}
          onClick={onConfirm}
        >
          {t('rewardConfirm.cta')}
        </BrandedButton>
        <BrandedButton
          variant="secondary"
          fullWidth
          disabled={submitting}
          onClick={onCancel}
        >
          {t('rewardConfirm.cancelCta')}
        </BrandedButton>
      </div>
    </ScreenShell>
  );
}
