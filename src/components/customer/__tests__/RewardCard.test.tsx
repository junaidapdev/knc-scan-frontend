import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RewardCard from '../RewardCard';
import type { IssuedReward } from '@/interfaces/reward';

const BASE_REWARD: IssuedReward = {
  id: 'r-1',
  unique_code: 'KAY-ABCD-1234',
  catalog_id: 'c-1',
  reward_name_snapshot: 'Box of 6 chocolates',
  reward_name_snapshot_ar: 'علبة 6 قطع شوكولاتة',
  reward_description_snapshot: 'Hand-crafted at Kayan.',
  reward_description_snapshot_ar: null,
  issued_at: '2026-04-01T10:00:00.000Z',
  expires_at: '2026-05-01T10:00:00.000Z',
  status: 'pending',
  redeemed_at: null,
  redeemed_at_branch_id: null,
};

describe('RewardCard', () => {
  it('shows the English name and description when lang=en', () => {
    render(
      <RewardCard
        reward={BASE_REWARD}
        language="en"
        statusLabel="Ready to claim"
      />,
    );
    expect(screen.getByText('Box of 6 chocolates')).toBeInTheDocument();
    expect(screen.getByText('Hand-crafted at Kayan.')).toBeInTheDocument();
    expect(screen.getByText('Ready to claim')).toBeInTheDocument();
    expect(screen.getByText('KAY-ABCD-1234')).toBeInTheDocument();
  });

  it('falls back to the Arabic snapshot when lang=ar and one is available', () => {
    render(
      <RewardCard
        reward={BASE_REWARD}
        language="ar"
        statusLabel="جاهزة"
      />,
    );
    expect(screen.getByText('علبة 6 قطع شوكولاتة')).toBeInTheDocument();
  });

  it('fires onClick for pending rewards and is disabled otherwise', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <RewardCard
        reward={BASE_REWARD}
        language="en"
        statusLabel="Ready"
        claimCtaLabel="Claim"
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <RewardCard
        reward={{ ...BASE_REWARD, status: 'redeemed' }}
        language="en"
        statusLabel="Redeemed"
        onClick={onClick}
      />,
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1); // unchanged
  });
});
