import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import BranchSelect from '../BranchSelect';
import type { Branch } from '@/interfaces/branch';
import { withI18n } from '@/test/i18nTestHarness';

const BRANCHES: Branch[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Al Nakheel',
    name_ar: null,
    city: 'Riyadh',
    city_ar: null,
    qr_identifier: 'NAKH-001',
    google_review_url: null,
    carries_boxed_chocolates: true,
    address: null,
    address_ar: null,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Corniche',
    name_ar: null,
    city: 'Jeddah',
    city_ar: null,
    qr_identifier: 'CORN-002',
    google_review_url: null,
    carries_boxed_chocolates: false,
    address: null,
    address_ar: null,
    active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
];

describe('BranchSelect', () => {
  it('renders all branches plus the placeholder', () => {
    render(
      withI18n(
        <BranchSelect
          label="Branch"
          placeholder="Pick a branch"
          branches={BRANCHES}
        />,
      ),
    );
    expect(screen.getByText('Pick a branch')).toBeInTheDocument();
    expect(screen.getByText(/Al Nakheel/)).toBeInTheDocument();
    expect(screen.getByText(/Corniche/)).toBeInTheDocument();
  });

  it('emits the selected branch id on change', async () => {
    const onChange = vi.fn();
    render(
      withI18n(
        <BranchSelect
          label="Branch"
          placeholder="Pick a branch"
          branches={BRANCHES}
          onChange={onChange}
          defaultValue=""
        />,
      ),
    );
    const select = screen.getByLabelText('Branch') as HTMLSelectElement;
    await userEvent.selectOptions(select, BRANCHES[1].id);
    expect(select.value).toBe(BRANCHES[1].id);
    expect(onChange).toHaveBeenCalled();
  });
});
