import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { logger } from '@/lib/logger';

/** Detect if the page is currently launched as an installed PWA. */
function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState<boolean>(false);
  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');
    const update = (): void => {
      // iOS Safari sets navigator.standalone; Chromium uses display-mode.
      const iosStandalone =
        // @ts-expect-error — iOS-only, not in the standard Navigator type.
        typeof window.navigator.standalone === 'boolean' &&
        // @ts-expect-error — see above.
        window.navigator.standalone === true;
      setStandalone(mql.matches || iosStandalone);
    };
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);
  return standalone;
}

/** True for iOS Safari (the only browser that doesn't fire beforeinstallprompt
 *  but where Add-to-Home-Screen is still possible via the Share menu). */
function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  // Treat all iOS browsers as "use Share → Add to Home Screen" since they all
  // use WebKit and inherit Safari's behavior re: PWA install.
  return isIOS;
}

/**
 * Install-app row for the Profile preferences card.
 *
 *  - Hides entirely when the app is already installed
 *  - On Chrome/Edge/Android: shows a primary CTA that triggers the native
 *    install prompt
 *  - On iOS Safari: shows a "How to install" toggle that expands inline
 *    instructions for using Share → Add to Home Screen
 */
export default function InstallAppRow(): JSX.Element | null {
  const { t } = useTranslation('customer');
  const { canInstall, promptInstall } = useInstallPrompt();
  const standalone = useIsStandalone();
  const [iosOpen, setIosOpen] = useState<boolean>(false);
  const ios = useMemo(isIosSafari, []);

  if (standalone) return null;

  const onInstall = async (): Promise<void> => {
    const outcome = await promptInstall();
    logger.info('[pwa] profile install outcome', outcome);
  };

  // Trailing divider — rendered alongside whichever variant we show, so it
  // never appears as an orphan when the row hides itself.
  const Divider = (
    <div
      aria-hidden="true"
      className="mx-4"
      style={{ height: 1, background: 'rgba(13,13,13,0.08)' }}
    />
  );

  // Native install path (Android/Chromium).
  if (canInstall) {
    return (
      <>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p
            className="font-sans font-bold text-obsidian"
            style={{ fontSize: 15 }}
          >
            {t('install.row.title')}
          </p>
          <p
            className="mt-0.5 font-sans font-medium text-obsidian/55"
            style={{ fontSize: 12 }}
          >
            {t('install.row.subtitle')}
          </p>
        </div>
        <button
          type="button"
          onClick={onInstall}
          className="rounded-full font-sans font-bold text-obsidian transition-colors hover:bg-yellow-hover focus:outline-none focus-visible:shadow-focus-yellow"
          style={{
            background: '#FFD700',
            border: '1.5px solid #0D0D0D',
            padding: '6px 14px',
            fontSize: 13,
          }}
        >
          {t('install.row.cta')}
        </button>
      </div>
      {Divider}
      </>
    );
  }

  // iOS Safari — manual instructions path.
  if (ios) {
    return (
      <>
      <div>
        <button
          type="button"
          onClick={() => setIosOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-colors hover:bg-obsidian/[0.02] focus:outline-none focus-visible:shadow-focus-yellow"
          aria-expanded={iosOpen}
        >
          <div className="min-w-0 flex-1">
            <p
              className="font-sans font-bold text-obsidian"
              style={{ fontSize: 15 }}
            >
              {t('install.row.title')}
            </p>
            <p
              className="mt-0.5 font-sans font-medium text-obsidian/55"
              style={{ fontSize: 12 }}
            >
              {t('install.row.iosHint')}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="font-display font-black text-obsidian transition-transform"
            style={{
              fontSize: 16,
              transform: iosOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            ⌄
          </span>
        </button>

        {iosOpen ? (
          <div
            className="mx-3 mb-3 rounded-xl px-4 py-3"
            style={{
              background: '#FFF8D6',
              border: '1px solid rgba(13,13,13,0.12)',
            }}
          >
            <ol
              className="space-y-2 font-sans font-medium text-obsidian"
              style={{ fontSize: 13, lineHeight: 1.5 }}
            >
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center justify-center font-display font-black"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: '#0D0D0D',
                    color: '#FFD700',
                    fontSize: 11,
                    marginTop: 1,
                    lineHeight: 1,
                  }}
                >
                  1
                </span>
                <span>{t('install.row.iosStep1')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center justify-center font-display font-black"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: '#0D0D0D',
                    color: '#FFD700',
                    fontSize: 11,
                    marginTop: 1,
                    lineHeight: 1,
                  }}
                >
                  2
                </span>
                <span>{t('install.row.iosStep2')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center justify-center font-display font-black"
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: '#0D0D0D',
                    color: '#FFD700',
                    fontSize: 11,
                    marginTop: 1,
                    lineHeight: 1,
                  }}
                >
                  3
                </span>
                <span>{t('install.row.iosStep3')}</span>
              </li>
            </ol>
          </div>
        ) : null}
      </div>
      {Divider}
      </>
    );
  }

  // Other browsers (Firefox desktop, etc.) — no install path. Hide.
  return null;
}
