import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { BrandedButton } from '@/components/common';

export interface ScanInstructionsSheetProps {
  open: boolean;
  onClose: () => void;
}

interface Step {
  n: number;
  bodyKey: string;
}
const STEPS: readonly Step[] = [
  { n: 1, bodyKey: 'scan.howTo.step1' },
  { n: 2, bodyKey: 'scan.howTo.step2' },
  { n: 3, bodyKey: 'scan.howTo.step3' },
] as const;

/**
 * Modal bottom-sheet that explains how to scan a Kayan branch QR.
 * Slides up from the bottom; backdrop fades in. Tapping the backdrop or
 * the "Got it" CTA dismisses. Locks body scroll while open.
 */
export default function ScanInstructionsSheet({
  open,
  onClose,
}: ScanInstructionsSheetProps): JSX.Element {
  const { t } = useTranslation('customer');
  const reduceMotion = useReducedMotion();

  // Lock the underlying page from scrolling while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(13,13,13,0.45)' }}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-howto-title"
            initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 32,
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md"
            style={{
              background: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              border: '1.5px solid #0D0D0D',
              borderBottom: 'none',
              paddingBottom: 'env(safe-area-inset-bottom)',
              boxShadow: '0 -16px 40px -12px rgba(13,13,13,0.25)',
            }}
          >
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-3">
              <span
                aria-hidden="true"
                className="block rounded-full"
                style={{
                  width: 44,
                  height: 4,
                  background: 'rgba(13,13,13,0.18)',
                }}
              />
            </div>

            <div className="px-6 pt-4 pb-6">
              {/* Eyebrow + title */}
              <p
                className="font-sans font-bold uppercase text-obsidian/55"
                style={{ fontSize: 10, letterSpacing: 1.8 }}
              >
                {t('scan.howTo.eyebrow')}
              </p>
              <h2
                id="scan-howto-title"
                className="mt-1 font-display font-black text-obsidian"
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  letterSpacing: '-0.8px',
                }}
              >
                {t('scan.howTo.title')}
              </h2>

              {/* Steps */}
              <ol className="mt-5 space-y-4">
                {STEPS.map((step) => (
                  <li
                    key={step.n}
                    className="flex items-start gap-4"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-flex shrink-0 items-center justify-center font-display font-black"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: '#FFD700',
                        color: '#0D0D0D',
                        border: '1.5px solid #0D0D0D',
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      {step.n}
                    </span>
                    <p
                      className="pt-1 font-sans font-medium text-obsidian"
                      style={{ fontSize: 14, lineHeight: 1.5 }}
                    >
                      {t(step.bodyKey)}
                    </p>
                  </li>
                ))}
              </ol>

              {/* Helper note */}
              <div
                className="mt-5 flex items-start gap-2 rounded-lg"
                style={{
                  padding: '10px 14px',
                  background: '#FFF8D6',
                  border: '1px solid rgba(13,13,13,0.12)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center justify-center font-display font-black"
                  style={{
                    background: '#0D0D0D',
                    color: '#FFD700',
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontSize: 9,
                    letterSpacing: 0.5,
                    marginTop: 2,
                  }}
                >
                  ?
                </span>
                <p
                  className="font-sans font-medium text-obsidian"
                  style={{ fontSize: 12, lineHeight: 1.45 }}
                >
                  {t('scan.howTo.help')}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-5">
                <BrandedButton fullWidth onClick={onClose}>
                  {t('scan.howTo.close')}
                </BrandedButton>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
