import { STAMPS_PER_CARD } from '@/constants/ui';

export interface StampProgressBarProps {
  current: number;
  max?: number;
  /** Index of the freshly-filled stamp (0-based) — pulses briefly. */
  highlightIndex?: number | null;
}

/**
 * 10-cell stamp grid. Filled stamps render solid obsidian; the just-earned
 * stamp (if `highlightIndex` is provided) gets a yellow ring pulse.
 */
export default function StampProgressBar({
  current,
  max = STAMPS_PER_CARD,
  highlightIndex = null,
}: StampProgressBarProps): JSX.Element {
  const cells = Array.from({ length: max }, (_, i) => i);
  return (
    <div
      className="grid grid-cols-5 gap-2"
      role="img"
      aria-label={`${current} of ${max} stamps`}
    >
      {cells.map((i) => {
        const filled = i < current;
        const isHighlight = highlightIndex === i;
        return (
          <div
            key={i}
            className={[
              'aspect-square rounded-md border-[1.5px] flex items-center justify-center transition-colors',
              filled
                ? 'bg-obsidian border-obsidian text-yellow'
                : 'bg-canvas-bg border-obsidian/20 text-obsidian/20',
              isHighlight ? 'ring-4 ring-yellow' : '',
            ].join(' ')}
          >
            <span className="font-display text-[18px] leading-none">
              {filled ? '✓' : i + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
}
