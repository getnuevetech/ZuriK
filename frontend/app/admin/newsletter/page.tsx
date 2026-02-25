'use client';

import React, { useEffect, useState, useCallback } from 'react';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import api from '../../../lib/api';

interface Subscriber {
  email: string;
  subscribedAt?: string;
  createdAt?: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const limit = 20;

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/newsletter/subscribers', { params: { page, limit } });
      const data = res.data;
      if (Array.isArray(data)) {
        setSubscribers(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        setSubscribers(data.items ?? data.data ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? Math.ceil((data.total ?? 0) / limit));
      }
    } catch {
      toast('error', 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const filtered = search.trim()
    ? subscribers.filter((s) => s.email.toLowerCase().includes(search.toLowerCase()))
    : subscribers;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Newsletter Subscribers" />

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="search"
            className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <p className="text-sm text-neutral-500 whitespace-nowrap">
            {total} subscriber{total !== 1 ? 's' : ''} total
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">
            {search ? 'No subscribers match your search.' : 'No subscribers yet.'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    {['Email', 'Subscribed Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filtered.map((sub) => {
                    const date = sub.subscribedAt ?? sub.createdAt;
                    return (
                      <tr key={sub.email} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 text-neutral-800">{sub.email}</td>
                        <td className="px-4 py-3 text-neutral-500">
                          {date ? new Date(date).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-neutral-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="text-xs px-3 py-1.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
