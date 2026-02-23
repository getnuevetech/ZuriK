'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { newsletterApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
  source: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 50;
  const { toast } = useToast();

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await newsletterApi.adminListSubscribers(page, limit);
      setSubscribers(data.items as Subscriber[]);
      setTotal(data.total as number);
    } catch {
      toast('error', 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminPageHeader
        title={`Newsletter Subscribers (${total})`}
      />

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">No subscribers yet.</div>
      ) : (
        <>
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 text-neutral-600 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-neutral-600 font-medium">Source</th>
                  <th className="text-left px-4 py-3 text-neutral-600 font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-neutral-600 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 text-neutral-900">{sub.email}</td>
                    <td className="px-4 py-3 text-neutral-500">{sub.source || 'homepage'}</td>
                    <td className="px-4 py-3 text-neutral-500">
                      {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {sub.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-neutral-200 rounded-lg disabled:opacity-50 hover:bg-neutral-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-neutral-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-neutral-200 rounded-lg disabled:opacity-50 hover:bg-neutral-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
