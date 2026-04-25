import type { IssuedReward, IssuedRewardStatus } from '@/interfaces/reward';

export interface RewardCardProps {
  reward: IssuedReward;
  language: 'en' | 'ar';
  statusLabel: string;
  metaLabel?: string;
  onClick?: (reward: IssuedReward) => void;
  claimCtaLabel?: string;
}

interface StatusBand {
  bg: string;
  dot: string;
  text: string;
}

const BAND: Record<IssuedRewardStatus, StatusBand> = {
  pending: { bg: '#FFD700', dot: '#0D0D0D', text: '#0D0D0D' },
  redeemed: { bg: '#E8E8E5', dot: '#1F7A3F', text: '#4A4A4A' },
  expired: { bg: 'rgba(13,13,13,0.05)', dot: '#8A8A87', text: '#8A8A87' },
};

/**
 * RewardCard v2 — bold editorial.
 * Status band header (yellow for pending with CLAIM chip; grey for redeemed;
 * faded for expired). 1.5px obsidian border on pending, hairline otherwise.
 * Code shown in JetBrains Mono inside a dashed pill.
 */
export default function RewardCard({
  reward,
  language,
  statusLabel,
  metaLabel,
  onClick,
  claimCtaLabel,
}: RewardCardProps): JSX.Element {
  const name =
    language === 'ar' && reward.reward_name_snapshot_ar
      ? reward.reward_name_snapshot_ar
      : reward.reward_name_snapshot;
  const description =
    language === 'ar' && reward.reward_description_snapshot_ar
      ? reward.reward_description_snapshot_ar
      : reward.reward_description_snapshot;

  const isPending = reward.status === 'pending';
  const isExpired = reward.status === 'expired';
  const clickable = isPending && typeof onClick === 'function';
  const band = BAND[reward.status];

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => {
        if (clickable && onClick) onClick(reward);
      }}
      className={[
        'block w-full overflow-hidden rounded-2xl bg-white text-start',
        'transition-colors duration-150',
        clickable ? 'cursor-pointer hover:shadow-[0_8px_22px_-12px_rgba(13,13,13,0.25)]' : 'cursor-default',
        isExpired ? 'opacity-60' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        border: isPending
          ? '1.5px solid #0D0D0D'
          : '1.5px solid rgba(13,13,13,0.08)',
      }}
    >
      {/* Status band */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: band.bg,
          borderBottom: isPending ? '1.5px solid #0D0D0D' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: band.dot }}
          />
          <span
            className="font-sans font-bold uppercase"
            style={{
              fontSize: 11,
              letterSpacing: '1.4px',
              color: band.text,
            }}
          >
            {statusLabel}
          </span>
        </div>
        {clickable && claimCtaLabel ? (
          <span
            className="rounded-full font-sans font-bold uppercase"
            style={{
              padding: '5px 12px',
              fontSize: 11,
              letterSpacing: '0.5px',
              background: '#0D0D0D',
              color: '#FFD700',
            }}
          >
            {claimCtaLabel} →
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <p
          className={[
            'font-display font-black leading-tight break-words',
            isExpired ? 'line-through text-obsidian/50' : 'text-obsidian',
          ].join(' ')}
          style={{ fontSize: 20, letterSpacing: '-0.5px' }}
        >
          {name}
        </p>
        {description ? (
          <p
            className="mt-1 font-sans font-medium leading-snug text-obsidian/65 line-clamp-2"
            style={{ fontSize: 13 }}
          >
            {description}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          {/* Code chip — dashed border, mono, LTR */}
          <span
            className="inline-flex items-center rounded-md font-mono font-bold"
            style={{
              padding: '4px 10px',
              fontSize: 12,
              letterSpacing: '1.5px',
              direction: 'ltr',
              border: '1.5px dashed rgba(13,13,13,0.3)',
              color: '#0D0D0D',
            }}
          >
            {reward.unique_code}
          </span>
          {metaLabel ? (
            <span
              className="font-sans font-semibold text-obsidian/55"
              style={{ fontSize: 12, direction: 'ltr' }}
            >
              {metaLabel}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
