import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, ScreenShell } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { haptic } from '@/lib/haptics';
import type { IssuedReward } from '@/interfaces/reward';

interface LocationState {
  reward?: IssuedReward;
}

export default function RewardDonePage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;
  const lang = (i18n.language.split('-')[0] ?? 'en') as 'en' | 'ar';

  useEffect(() => {
    haptic(30);
  }, []);

  const name = stateParams.reward
    ? lang === 'ar' && stateParams.reward.reward_name_snapshot_ar
      ? stateParams.reward.reward_name_snapshot_ar
      : stateParams.reward.reward_name_snapshot
    : '';

  return (
    <ScreenShell
      eyebrow={t('rewardDone.eyebrow')}
      title={t('rewardDone.title')}
      description={t('rewardDone.description')}
    >
      {name ? (
        <div className="rounded-lg border-hairline border-obsidian/10 bg-white p-5">
          <p className="font-display text-[22px] leading-tight text-obsidian">
            {name}
          </p>
          {stateParams.reward ? (
            <p className="mt-1 font-mono text-[12px] text-obsidian/60">
              {stateParams.reward.unique_code}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6">
        <BrandedButton
          fullWidth
          onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
        >
          {t('rewardDone.cta')}
        </BrandedButton>
      </div>
    </ScreenShell>
  );
}
