import React from 'react';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  keyExtractor: (row: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no entries to display right now.',
  keyExtractor,
}: DataTableProps<T>) {
  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={`px-6 py-3.5 font-semibold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="hover:bg-slate-800/40 transition-colors duration-150"
            >
              {columns.map((col, idx) => (
                <td key={idx} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                  {col.cell
                    ? col.cell(row)
                    : col.accessorKey
                    ? (row[col.accessorKey] as any)
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
