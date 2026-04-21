import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

import AdminEmptyState from './AdminEmptyState';

export interface AdminDataTablePagination {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface AdminDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  isLoading?: boolean;
  emptyTitle: string;
  emptySubtitle?: string;
  pagination?: AdminDataTablePagination;
  onRowClick?: (row: T) => void;
}

const SKELETON_ROWS = 5;

export default function AdminDataTable<T>({
  data,
  columns,
  isLoading,
  emptyTitle,
  emptySubtitle,
  pagination,
  onRowClick,
}: AdminDataTableProps<T>): JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable<T>({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
    : 1;

  return (
    <div className="overflow-hidden rounded-lg border border-obsidian/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-obsidian/5 text-left text-xs uppercase tracking-wider text-obsidian/70">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="cursor-pointer px-4 py-3 font-semibold"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-t border-obsidian/5">
                  {columns.map((_col, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 w-full animate-pulse rounded bg-obsidian/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <AdminEmptyState title={emptyTitle} subtitle={emptySubtitle} />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row: Row<T>) => (
                <tr
                  key={row.id}
                  className={`border-t border-obsidian/5 ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-obsidian/5'
                      : ''
                  }`}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-obsidian">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination ? (
        <div className="flex items-center justify-between border-t border-obsidian/10 px-4 py-3 text-sm">
          <p className="text-obsidian/60">
            Page {pagination.page} of {totalPages} · {pagination.total} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border border-obsidian/20 px-3 py-1 text-obsidian disabled:opacity-40"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border border-obsidian/20 px-3 py-1 text-obsidian disabled:opacity-40"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
