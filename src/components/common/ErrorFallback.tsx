import { useTranslation } from 'react-i18next';

import BrandedButton from './BrandedButton';

export interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorFallback({
  title,
  message,
  onRetry,
  className = '',
}: ErrorFallbackProps): JSX.Element {
  const { t } = useTranslation('common');
  return (
    <div
      role="alert"
      className={`rounded-lg border-hairline border-obsidian/10 bg-canvas p-6 text-center ${className}`}
    >
      <p className="eyebrow text-danger">{title ?? t('status.errorTitle')}</p>
      <p className="mt-2 font-sans text-[14px] text-obsidian/80">
        {message ?? t('status.unknownError')}
      </p>
      {onRetry ? (
        <div className="mt-4 flex justify-center">
          <BrandedButton variant="secondary" size="md" onClick={onRetry}>
            {t('actions.retry')}
          </BrandedButton>
        </div>
      ) : null}
    </div>
  );
}
