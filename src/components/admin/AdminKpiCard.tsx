export interface AdminKpiCardProps {
  title: string;
  value: string | number;
  /** Positive delta renders green ↑; negative renders red ↓. */
  delta?: number;
  deltaLabel?: string;
  loading?: boolean;
}

export default function AdminKpiCard({
  title,
  value,
  delta,
  deltaLabel,
  loading,
}: AdminKpiCardProps): JSX.Element {
  if (loading) {
    return (
      <div
        className="flex h-28 flex-col justify-between rounded-lg border border-obsidian/10 bg-white p-4"
        data-testid="kpi-card-skeleton"
      >
        <div className="h-3 w-24 animate-pulse rounded bg-obsidian/10" />
        <div className="h-8 w-32 animate-pulse rounded bg-obsidian/10" />
      </div>
    );
  }

  const deltaPositive = typeof delta === 'number' && delta > 0;
  const deltaNegative = typeof delta === 'number' && delta < 0;

  return (
    <div className="flex h-28 flex-col justify-between rounded-lg border border-obsidian/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-obsidian/60">
        {title}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="font-mono text-3xl font-bold text-obsidian">{value}</p>
        {typeof delta === 'number' ? (
          <span
            className={`text-xs font-semibold ${
              deltaPositive
                ? 'text-green-600'
                : deltaNegative
                  ? 'text-red-600'
                  : 'text-obsidian/50'
            }`}
            data-testid="kpi-delta"
          >
            {deltaPositive ? '↑' : deltaNegative ? '↓' : '→'}{' '}
            {Math.abs(delta)}
            {deltaLabel ? ` ${deltaLabel}` : ''}
          </span>
        ) : null}
      </div>
    </div>
  );
}
