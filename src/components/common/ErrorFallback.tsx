import { useTranslation } from 'react-i18next';

import BrandedButton from './BrandedButton';

export interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * v2 ErrorFallback — yellow rotated "!" tile + bold editorial copy.
 * Used inline inside any page that wants to surface an error state.
 */
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
      className={`flex flex-col items-center text-center ${className}`}
      style={{
        padding: '32px 16px',
        background: 'transparent',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center font-display font-black"
        style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: '#FFD700',
          color: '#0D0D0D',
          border: '2.5px solid #0D0D0D',
          fontSize: 48,
          lineHeight: 1,
          transform: 'rotate(-3deg)',
        }}
      >
        !
      </span>
      <h2
        className="font-display font-black text-obsidian"
        style={{
          marginTop: 18,
          fontSize: 24,
          letterSpacing: '-0.6px',
          lineHeight: 1,
        }}
      >
        {title ?? t('status.errorTitle')}
      </h2>
      <p
        className="mt-2 font-sans font-medium text-obsidian/65"
        style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}
      >
        {message ?? t('status.unknownError')}
      </p>
      {onRetry ? (
        <div className="mt-5">
          <BrandedButton size="md" onClick={onRetry}>
            {t('actions.retry')}
          </BrandedButton>
        </div>
      ) : null}
    </div>
  );
}
