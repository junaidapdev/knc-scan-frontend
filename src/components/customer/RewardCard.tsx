import type { IssuedReward, IssuedRewardStatus } from '@/interfaces/reward';

export interface RewardCardProps {
  reward: IssuedReward;
  language: 'en' | 'ar';
  statusLabel: string;
  metaLabel?: string;
  onClick?: (reward: IssuedReward) => void;
  claimCtaLabel?: string;
}

const STATUS_STYLES: Record<IssuedRewardStatus, string> = {
  pending: 'bg-yellow text-obsidian border-yellow',
  redeemed: 'bg-canvas-bg text-obsidian/60 border-obsidian/10',
  expired: 'bg-canvas-bg text-danger border-danger/40',
};

/** Card summarizing a single IssuedReward — tappable when pending. */
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

  const clickable = reward.status === 'pending' && typeof onClick === 'function';

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => {
        if (clickable && onClick) onClick(reward);
      }}
      className={[
        'w-full text-start rounded-lg border-hairline border-obsidian/10 bg-white p-5',
        'transition-colors duration-150',
        clickable ? 'hover:border-obsidian/40 cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      <div className="flex flex-col gap-2">
        <span
          className={[
            'self-start rounded-full border-[1.5px] px-2.5 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-[1.5px]',
            STATUS_STYLES[reward.status],
          ].join(' ')}
        >
          {statusLabel}
        </span>
        <p className="font-display text-[20px] leading-tight text-obsidian break-words">
          {name}
        </p>
        {description ? (
          <p className="font-sans text-[13px] leading-snug text-obsidian/60 line-clamp-2">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[12px] text-obsidian/50">
          {reward.unique_code}
        </span>
        {metaLabel ? (
          <span className="font-sans text-[12px] text-obsidian/50">
            {metaLabel}
          </span>
        ) : null}
      </div>

      {clickable && claimCtaLabel ? (
        <div className="mt-3 border-t-hairline border-obsidian/10 pt-3">
          <span className="font-sans text-[13px] font-semibold text-obsidian">
            {claimCtaLabel} →
          </span>
        </div>
      ) : null}
    </button>
  );
}
