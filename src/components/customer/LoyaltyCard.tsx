import { motion, useReducedMotion } from 'framer-motion';

export interface LoyaltyCardProps {
  name: string;
  phoneLast4: string;
  current: number;
  max: number;
  eyebrow: string;
  countLabel: string;
}

/**
 * Yellow loyalty card hero — stamp grid + shimmer + customer name/phone.
 * Pure presentation; parent passes all copy already localized.
 */
export default function LoyaltyCard({
  name,
  phoneLast4,
  current,
  max,
  eyebrow,
  countLabel,
}: LoyaltyCardProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const cells = Array.from({ length: max }, (_, i) => i);
  const newestFilledIndex = current > 0 ? current - 1 : -1;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-yellow p-5 text-obsidian shadow-[0_10px_30px_-8px_rgba(13,13,13,0.25)]">
      {!reduceMotion ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            backgroundSize: '250% 100%',
          }}
          animate={{ backgroundPositionX: ['150%', '-50%'] }}
          transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-obsidian/70">{eyebrow}</p>
          <p className="mt-2 font-display text-[32px] leading-none tracking-display">
            {countLabel}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-hover text-[22px] shadow-inner"
        >
          ⭐️
        </span>
      </div>

      <div className="relative mt-5 grid grid-cols-5 gap-2">
        {cells.map((i) => {
          const filled = i < current;
          const isNewest = i === newestFilledIndex;
          return (
            <motion.div
              key={i}
              initial={
                isNewest && !reduceMotion
                  ? { scale: 0.6, opacity: 0.4 }
                  : false
              }
              animate={
                isNewest && !reduceMotion
                  ? { scale: [1, 1.15, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={[
                'aspect-square rounded-lg flex items-center justify-center',
                filled
                  ? 'bg-transparent'
                  : 'border-2 border-dashed border-obsidian/25',
              ].join(' ')}
            >
              {filled ? (
                <span className="flex h-full w-full items-center justify-center rounded-lg bg-obsidian text-[20px] leading-none">
                  🍬
                </span>
              ) : (
                <span className="font-display text-[16px] text-obsidian/40">
                  {i + 1}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <p className="font-display text-[14px] uppercase leading-none tracking-[2px] text-obsidian">
          {name || '•••'}
        </p>
        <p className="font-mono text-[13px] text-obsidian/80">
          •••• {phoneLast4}
        </p>
      </div>
    </div>
  );
}
