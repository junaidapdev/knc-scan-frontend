import { useEffect, useState } from 'react';

export interface CountdownPillProps {
  /** ISO timestamp the countdown targets. */
  expiresAt: string;
  label: string;
  onExpire?: () => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Long horizons (voucher-style expiries): humane units instead of MM:SS.
  if (days >= 1) return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  if (hours >= 1) return `${hours}h ${String(minutes).padStart(2, '0')}m`;

  // Under an hour: MM:SS, appropriate for short-lived tokens.
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Monospace pill that ticks down to `expiresAt`. */
export default function CountdownPill({
  expiresAt,
  label,
  onExpire,
}: CountdownPillProps): JSX.Element {
  const [now, setNow] = useState<number>(() => Date.now());
  const target = Date.parse(expiresAt);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Number.isFinite(target) && target - now <= 0 && onExpire) {
      onExpire();
    }
  }, [target, now, onExpire]);

  const remaining = Number.isFinite(target) ? target - now : 0;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border-hairline border-obsidian/20 bg-white px-3 py-1">
      <span className="eyebrow text-obsidian/60">{label}</span>
      <span className="font-mono text-[14px] text-obsidian">
        {formatRemaining(remaining)}
      </span>
    </div>
  );
}
