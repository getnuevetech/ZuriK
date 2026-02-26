'use client';

import React, { ReactNode } from 'react';
import { useState } from 'react';

export interface Column<T = Record<string, unknown>> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, dir: 'asc' | 'desc') => void;
  pagination?: PaginationProps;
}

export default function DataTable<T = Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No data found.',
  onSort,
  pagination,
}: DataTableProps<T>) {
  // Tracks current sort UI state; actual sorting is delegated to the parent via onSort.
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: string) {
    if (!onSort) return;
    const nextDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(nextDir);
    onSort(key, nextDir);
  }

  const pageNumbers = pagination
    ? Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
    : [];

  return (
    <div className="flex flex-col gap-0 admin-surface overflow-hidden">
      <div className="overflow-x-auto relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center z-10">
            <svg
              className="animate-spin h-8 w-8 text-[#8f755a]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        )}

        <table className="min-w-full text-sm">
          <thead className="bg-[#f6f0e8] border-b border-[#e3d8cb]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[11px] font-semibold text-[#8b8073] uppercase tracking-[0.18em] whitespace-nowrap ${
                    col.sortable ? 'cursor-pointer select-none hover:text-[#5b4f42]' : ''
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <span className="text-[#b3a597]">
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eee3d7]">
            {loading && data.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fbf7f1]'}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-[#ece0d3] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
              ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-[#9b8f82] text-sm"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )
              : data.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className={`transition-colors hover:bg-[#f6ece1] ${
                      rowIdx % 2 === 0 ? 'bg-white' : 'bg-[#fcf8f3]'
                    }`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-[#51493f] whitespace-nowrap">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e3d8cb] bg-[#fffdf9]">
          <span className="text-xs text-[#8f8376]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 text-xs rounded border border-[#dfd3c6] text-[#6f6355] hover:bg-[#f4eadf] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => pagination.onPageChange(p)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  p === pagination.page
                    ? 'bg-[#2e436f] border-[#2e436f] text-white'
                    : 'border-[#dfd3c6] text-[#6f6355] hover:bg-[#f4eadf]'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 text-xs rounded border border-[#dfd3c6] text-[#6f6355] hover:bg-[#f4eadf] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
