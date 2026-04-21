import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ApiCallError, pickErrorMessage } from '@/lib/api';

/**
 * Returns a callback that toasts the best available message for an error
 * — bilingual ApiCallError message in the current language when possible,
 * falling back to a generic unknown copy.
 */
export function useApiErrorToast(): (err: unknown) => void {
  const { i18n, t } = useTranslation('customer');
  return useCallback(
    (err: unknown): void => {
      const lang = (i18n.language.split('-')[0] ?? 'ar') as 'en' | 'ar';
      const msg =
        err instanceof ApiCallError
          ? pickErrorMessage(err, lang)
          : t('errors.unknown');
      toast.error(msg);
    },
    [i18n, t],
  );
}
