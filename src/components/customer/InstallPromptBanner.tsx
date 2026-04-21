import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  INSTALL_PROMPT_DISMISSED_KEY,
  INSTALL_PROMPT_STAMP_COUNT_KEY,
  INSTALL_PROMPT_THRESHOLD,
} from '@/constants/ui';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { logger } from '@/lib/logger';

/**
 * Dismissible install banner. Renders only when:
 *   - the browser fired `beforeinstallprompt` (canInstall), AND
 *   - the user has earned enough stamps to trigger (>= threshold), AND
 *   - the user hasn't dismissed it before.
 */
export default function InstallPromptBanner(): JSX.Element | null {
  const { t } = useTranslation('customer');
  const { canInstall, promptInstall } = useInstallPrompt();
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!canInstall) {
      setVisible(false);
      return;
    }
    if (localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === '1') {
      setVisible(false);
      return;
    }
    const raw = localStorage.getItem(INSTALL_PROMPT_STAMP_COUNT_KEY);
    const count = raw ? Number.parseInt(raw, 10) : 0;
    setVisible(
      Number.isFinite(count) && count >= INSTALL_PROMPT_THRESHOLD,
    );
  }, [canInstall]);

  const dismiss = (): void => {
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, '1');
    setVisible(false);
  };

  const install = async (): Promise<void> => {
    const outcome = await promptInstall();
    logger.info('[pwa] install prompt outcome', outcome);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t('install.prompt.title')}
      className="fixed bottom-4 start-4 end-4 z-50 mx-auto max-w-md rounded-lg border-hairline border-obsidian/10 bg-white p-4 shadow-lg"
    >
      <p className="font-sans text-[14px] font-semibold text-obsidian">
        {t('install.prompt.title')}
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={install}
          className="flex-1 rounded-md bg-yellow px-4 py-2 font-sans text-[13px] font-semibold text-obsidian hover:bg-yellow-hover"
        >
          {t('install.prompt.cta')}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-md border-hairline border-obsidian/20 bg-white px-4 py-2 font-sans text-[13px] text-obsidian hover:bg-obsidian/5"
        >
          {t('install.prompt.dismiss')}
        </button>
      </div>
    </div>
  );
}
