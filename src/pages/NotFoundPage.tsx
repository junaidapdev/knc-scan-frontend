import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';

import {
  BrandedButton,
  KayanLogo,
  LanguageToggle,
  PageTransition,
} from '@/components/common';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage(): JSX.Element {
  const { t } = useTranslation('customer');
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col bg-canvas-bg animate-fade-in">
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <KayanLogo height={34} />
        <LanguageToggle />
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-6 text-center">
        <PageTransition>
          {/* Big rotated 404 yellow tile */}
          <span
            aria-hidden="true"
            className="inline-flex items-center justify-center font-display font-black"
            style={{
              fontSize: 120,
              lineHeight: 1,
              letterSpacing: '-5px',
              background: '#FFD700',
              color: '#0D0D0D',
              padding: '4px 20px',
              border: '3px solid #0D0D0D',
              borderRadius: 16,
              transform: 'rotate(-2deg)',
            }}
          >
            404
          </span>

          <h1
            className="font-display font-black text-obsidian"
            style={{
              marginTop: 28,
              fontSize: 36,
              letterSpacing: '-1px',
              lineHeight: 1,
            }}
          >
            {t('notFound.headline')}
          </h1>
          <p
            className="mt-2 font-sans font-medium text-obsidian/65"
            style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}
          >
            {t('notFound.body')}
          </p>

          <div className="mt-8 w-full">
            <BrandedButton
              fullWidth
              onClick={() => navigate(ROUTES.CUSTOMER.SCAN)}
            >
              {t('notFound.cta')}
            </BrandedButton>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
