import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import AdminKpiCard from '../AdminKpiCard';

describe('AdminKpiCard', () => {
  it('renders the title and value', () => {
    render(<AdminKpiCard title="Scans" value={1234} />);
    expect(screen.getByText('Scans')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders a skeleton when loading', () => {
    render(<AdminKpiCard title="Scans" value={0} loading />);
    expect(screen.getByTestId('kpi-card-skeleton')).toBeInTheDocument();
    // Value should not be shown while loading.
    expect(screen.queryByText('Scans')).toBeNull();
  });

  it('shows an up arrow for a positive delta', () => {
    render(<AdminKpiCard title="Scans" value={10} delta={5} />);
    const delta = screen.getByTestId('kpi-delta');
    expect(delta.textContent).toContain('↑');
  });

  it('shows a down arrow for a negative delta', () => {
    render(<AdminKpiCard title="Scans" value={10} delta={-3} />);
    const delta = screen.getByTestId('kpi-delta');
    expect(delta.textContent).toContain('↓');
  });
});
