import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { BrandedButton, OnboardingShell } from '@/components/common';
import { ROUTES } from '@/constants/routes';

interface LocationState {
  nextEligibleAt?: string;
}

interface SplitDate {
  /** Localised "April 26, 2026" — full date. */
  date: string;
  /** Localised "2:14 PM" — time only. */
  time: string;
}

function splitDate(iso: string | undefined, lang: string): SplitDate | null {
  if (!iso) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  try {
    const d = new Date(ms);
    return {
      date: new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(d),
      time: new Intl.DateTimeFormat(lang, { timeStyle: 'short' }).format(d),
    };
  } catch {
    return null;
  }
}

/**
 * Lockout screen — shown when the customer scanned within the 24h cooldown.
 * Public route (no guard) so the user can always navigate back.
 */
export default function LockoutPage(): JSX.Element {
  const { t, i18n } = useTranslation('customer');
  const navigate = useNavigate();
  const location = useLocation();
  const stateParams = (location.state ?? {}) as LocationState;

  const split = splitDate(stateParams.nextEligibleAt, i18n.language);

  return (
    <OnboardingShell
      onBack={() => navigate(ROUTES.CUSTOMER.SCAN)}
      footer={
        <BrandedButton
          variant="secondary"
          fullWidth
          onClick={() => navigate(ROUTES.CUSTOMER.SCAN)}
        >
          {t('lockout.cta')}
        </BrandedButton>
      }
    >
      {/* Centered hero — yellow ١٠ tile with rotated "stamped" badge */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="self-start">
          <div
            className="relative inline-flex items-center justify-center"
            style={{
              width: 100,
              height: 100,
              borderRadius: 18,
              background: '#FFD700',
              border: '2.5px solid #0D0D0D',
              transform: 'rotate(-3deg)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                fontFamily: '"Noto Naskh Arabic", system-ui, sans-serif',
                fontWeight: 700,
                fontSize: 56,
                color: '#0D0D0D',
                letterSpacing: -3,
                lineHeight: 1,
              }}
            >
              ١٠
            </span>
            <span
              className="absolute font-sans font-bold uppercase"
              style={{
                bottom: -10,
                right: -10,
                padding: '5px 10px',
                borderRadius: 4,
                background: '#0D0D0D',
                color: '#FFD700',
                fontSize: 10,
                letterSpacing: 1.4,
                transform: 'rotate(3deg)',
              }}
            >
              {t('lockout.stampedBadge')}
            </span>
          </div>
        </div>

        <h1
          className="font-display font-black text-obsidian"
          style={{
            fontSize: 38,
            lineHeight: 0.95,
            letterSpacing: '-1.5px',
            margin: '32px 0 14px',
          }}
        >
          {t('lockout.headlinePre')}
          <br />
          <span
            className="relative inline-block"
            style={{
              background: '#FFD700',
              padding: '0 8px',
              transform: 'rotate(-1deg)',
            }}
          >
            {t('lockout.headlineMark')}
          </span>
        </h1>
        <p
          className="font-sans font-medium text-obsidian/65"
          style={{ fontSize: 14, lineHeight: 1.5 }}
        >
          {t('lockout.body')}
        </p>

        {/* Next-stamp card */}
        <div
          className="mt-6 rounded-2xl"
          style={{
            padding: 18,
            background: '#FFFFFF',
            border: '1.5px solid #0D0D0D',
          }}
        >
          <p
            className="font-sans font-bold uppercase text-obsidian/55"
            style={{ fontSize: 10, letterSpacing: 1.8 }}
          >
            {t('lockout.nextLabel')}
          </p>
          {split ? (
            <>
              <p
                className="font-display font-extrabold text-obsidian"
                style={{ fontSize: 24, letterSpacing: '-0.6px', marginTop: 6 }}
              >
                {t('lockout.nextLine')}{' '}
                <span
                  style={{
                    background: '#FFD700',
                    padding: '0 6px',
                  }}
                >
                  {split.time}
                </span>
              </p>
              <p
                className="mt-1 font-sans font-medium text-obsidian/65"
                style={{ fontSize: 13 }}
              >
                {split.date}
              </p>
            </>
          ) : (
            <p
              className="font-display font-extrabold text-obsidian"
              style={{ fontSize: 22, marginTop: 6 }}
            >
              {t('lockout.whenShortly')}
            </p>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
}
