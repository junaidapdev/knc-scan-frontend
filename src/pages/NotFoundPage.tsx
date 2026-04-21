import { Link } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { ROUTES } from '@/constants/routes';

export default function NotFoundPage(): JSX.Element {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas-bg px-6 text-center">
      <h1 className="font-display text-display-lg text-obsidian">404</h1>
      <p className="mt-3 font-sans text-[14px] text-obsidian/60">
        {t('status.comingSoon')}
      </p>
      <Link
        to={ROUTES.CUSTOMER.SCAN}
        className="mt-6 font-sans text-[13px] font-semibold text-obsidian underline underline-offset-4"
      >
        {t('actions.back')}
      </Link>
    </main>
  );
}
