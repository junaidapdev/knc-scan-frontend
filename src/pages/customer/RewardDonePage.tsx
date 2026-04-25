import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';

import {
  BrandedButton,
  KayanLogo,
  LanguageToggle,
  PageTransition,
} from '@/components/common';
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    haptic(30);
  }, []);

  const name = stateParams.reward
    ? lang === 'ar' && stateParams.reward.reward_name_snapshot_ar
      ? stateParams.reward.reward_name_snapshot_ar
      : stateParams.reward.reward_name_snapshot
    : '';
  const code = stateParams.reward?.unique_code ?? '';

  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <KayanLogo height={34} />
        <LanguageToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-8 pt-2">
        <PageTransition>
          {/* Yellow hero — fills available space */}
          <div
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl"
            style={{
              padding: 28,
              background: '#FFD700',
              color: '#0D0D0D',
              border: '2px solid #0D0D0D',
              minHeight: 460,
            }}
          >
            <div>
              {/* Obsidian ✓ badge — slightly rotated, pop animation */}
              <motion.div
                initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 320,
                  damping: 18,
                  delay: 0.1,
                }}
                className="inline-flex items-center justify-center font-display font-black"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: '#0D0D0D',
                  color: '#FFD700',
                  fontSize: 36,
                  transform: reduceMotion ? undefined : 'rotate(-4deg)',
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                ✓
              </motion.div>

              <h1
                className="font-display font-black"
                style={{
                  marginTop: 24,
                  fontSize: 52,
                  lineHeight: 0.92,
                  letterSpacing: '-2.5px',
                  whiteSpace: 'pre-line',
                }}
              >
                {t('rewardDone.headline')}
              </h1>
              <p
                className="font-sans font-medium"
                style={{
                  marginTop: 14,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'rgba(13,13,13,0.78)',
                  maxWidth: 280,
                }}
              >
                {t('rewardDone.description')}
              </p>
            </div>

            {/* Redeemed details — obsidian inset */}
            {name ? (
              <div
                className="rounded-2xl"
                style={{
                  marginTop: 28,
                  padding: 16,
                  background: '#0D0D0D',
                  color: '#FFD700',
                }}
              >
                <p
                  className="font-sans font-bold uppercase opacity-70"
                  style={{ fontSize: 10, letterSpacing: 1.8 }}
                >
                  {t('rewardDone.redeemedLabel')}
                </p>
                <p
                  className="font-display font-black"
                  style={{
                    marginTop: 4,
                    fontSize: 20,
                    letterSpacing: '-0.4px',
                  }}
                >
                  {name}
                </p>
                {code ? (
                  <p
                    className="font-mono font-bold opacity-85"
                    style={{
                      marginTop: 10,
                      fontSize: 14,
                      letterSpacing: 1.5,
                      direction: 'ltr',
                      wordBreak: 'break-all',
                    }}
                  >
                    {code}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-3">
            <BrandedButton
              variant="secondary"
              fullWidth
              onClick={() => navigate(ROUTES.CUSTOMER.REWARDS)}
            >
              {t('rewardDone.cta')}
            </BrandedButton>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
