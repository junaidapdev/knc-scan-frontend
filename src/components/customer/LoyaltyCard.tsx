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
 * Kayan Sweets loyalty card hero (v2).
 * Dark obsidian card — bold editorial system.
 * Stamp grid: filled = obsidian square with yellow ١٠ glyph; latest = yellow
 * square with glow; empty = obsidian/25 dashed square with number.
 * Background decoration: large translucent ١٠ glyph as watermark.
 * Pure presentation — parent passes all copy already localised.
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
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white"
      style={{
        background: '#0D0D0D',
        border: '2.5px solid #0D0D0D',
        boxShadow: '0 12px 32px -8px rgba(13,13,13,0.45)',
      }}
    >
      {/* Watermark ١٠ */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 -end-3 select-none font-sans leading-none text-white/[0.04]"
        style={{
          fontSize: 180,
          fontFamily: '"Noto Naskh Arabic", system-ui, sans-serif',
          fontWeight: 700,
        }}
      >
        ١٠
      </span>

      {/* Top row — eyebrow + count + brand mark */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p
            className="font-sans text-[10px] uppercase tracking-[3px] text-white/50"
          >
            {eyebrow}
          </p>
          <p
            className="mt-2 font-display font-black leading-none text-white"
            style={{ fontSize: 38, letterSpacing: 3 }}
          >
            {countLabel}
          </p>
        </div>

        {/* ١٠ brand mark badge */}
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: 52,
            height: 52,
            background: '#FFD700',
            fontFamily: '"Noto Naskh Arabic", system-ui, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#0D0D0D',
            lineHeight: 1,
          }}
        >
          ١٠
        </span>
      </div>

      {/* Stamp grid */}
      <div className="relative mt-5 grid grid-cols-5 gap-2">
        {cells.map((i) => {
          const filled = i < current;
          const isNewest = i === newestFilledIndex;
          const isLatest = isNewest && filled;

          return (
            <motion.div
              key={i}
              initial={
                isLatest && !reduceMotion
                  ? { scale: 0.6, opacity: 0.4 }
                  : false
              }
              animate={
                isLatest && !reduceMotion
                  ? { scale: [1, 1.18, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="aspect-square rounded-lg flex items-center justify-center"
              style={
                isLatest
                  ? {
                      background: '#FFD700',
                      boxShadow: '0 0 12px rgba(255,215,0,0.6)',
                      transform: !reduceMotion ? 'rotate(-4deg)' : undefined,
                    }
                  : filled
                    ? { background: '#1A1A1A', border: '1.5px solid #2E2E2E' }
                    : { border: '1.5px dashed rgba(255,255,255,0.18)' }
              }
            >
              {filled ? (
                <span
                  style={{
                    fontFamily:
                      '"Noto Naskh Arabic", system-ui, sans-serif',
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: isLatest ? '#0D0D0D' : '#FFD700',
                    userSelect: 'none',
                  }}
                >
                  ١٠
                </span>
              ) : (
                <span
                  className="font-mono text-[12px] font-medium leading-none"
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  {i + 1}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom row — name + phone */}
      <div className="relative mt-5 flex items-end justify-between gap-3">
        <p
          className="font-display font-black uppercase leading-none tracking-[2px] text-white"
          style={{ fontSize: 13 }}
        >
          {name || '•••'}
        </p>
        <p
          className="font-mono text-white/50"
          style={{ fontSize: 12 }}
        >
          •••• {phoneLast4}
        </p>
      </div>
    </div>
  );
}
