import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ColumnDef } from '@tanstack/react-table';

import AdminDataTable from '../AdminDataTable';

interface Row {
  id: string;
  name: string;
  count: number;
}

const COLUMNS: ColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'count', header: 'Count' },
];

const ROWS: Row[] = [
  { id: '1', name: 'Alpha', count: 3 },
  { id: '2', name: 'Bravo', count: 7 },
];

describe('AdminDataTable', () => {
  it('renders rows from the data prop', () => {
    render(
      <AdminDataTable<Row>
        data={ROWS}
        columns={COLUMNS}
        emptyTitle="Nothing"
      />,
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Bravo')).toBeInTheDocument();
  });

  it('renders the empty state when data is empty', () => {
    render(
      <AdminDataTable<Row>
        data={[]}
        columns={COLUMNS}
        emptyTitle="Nothing here"
        emptySubtitle="Try another filter"
      />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
    expect(screen.getByText('Try another filter')).toBeInTheDocument();
  });

  it('renders pagination controls when pagination is provided', async () => {
    const onPageChange = vi.fn();
    render(
      <AdminDataTable<Row>
        data={ROWS}
        columns={COLUMNS}
        emptyTitle="Nothing"
        pagination={{
          page: 2,
          pageSize: 20,
          total: 100,
          onPageChange,
        }}
      />,
    );
    expect(screen.getByText(/Page 2 of 5/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
