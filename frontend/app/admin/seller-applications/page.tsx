'use client';

import React, { useState, useEffect } from 'react';
import { sellerApplicationsApi, type SellerApplication } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';

export default function AdminSellerApplicationsPage() {
  const { toast } = useToast();

  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SellerApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  async function fetchApplications() {
    setLoading(true);
    try {
      const data = await sellerApplicationsApi.getAll(statusFilter || undefined);
      setApplications(data);
    } catch {
      toast('error', 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }

  async function handleReview(decision: 'approved' | 'rejected') {
    if (!selected) return;
    setReviewing(true);
    try {
      await sellerApplicationsApi.review(selected.id, { status: decision, adminNotes: reviewNotes || undefined });
      toast(
        decision === 'approved' ? 'success' : 'warning',
        decision === 'approved' ? 'Application Approved' : 'Application Rejected',
      );
      setSelected(null);
      setReviewNotes('');
      await fetchApplications();
    } catch (err: any) {
      toast('error', err?.response?.data?.message || 'Failed to review application.');
    } finally {
      setReviewing(false);
    }
  }

  const columns = [
    {
      key: 'applicant',
      header: 'Applicant',
      render: (row: SellerApplication) => (
        <div>
          <p className="font-medium text-neutral-900">
            {row.applicant ? `${row.applicant.firstName} ${row.applicant.lastName}` : 'Unknown'}
          </p>
          <p className="text-sm text-neutral-500">{row.applicant?.email}</p>
        </div>
      ),
    },
    {
      key: 'businessName',
      header: 'Business',
      render: (row: SellerApplication) => <span className="text-neutral-700">{row.businessName}</span>,
    },
    {
      key: 'requestedRole',
      header: 'Role',
      render: (row: SellerApplication) => (
        <span className="text-neutral-700 capitalize">{row.requestedRole.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: SellerApplication) => <StatusBadge status={row.status} />,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row: SellerApplication) => (
        <span className="text-sm text-neutral-500">{new Date(row.createdAt).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: SellerApplication) => (
        <button
          onClick={() => { setSelected(row); setReviewNotes(row.adminNotes || ''); }}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Seller Applications" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Seller Applications' }]} />

      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              statusFilter === s
                ? 'bg-indigo-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={applications}
            loading={false}
            emptyMessage="No applications found"
          />
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Review Application</h2>
              <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-neutral-700 text-xl">×</button>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Applicant</p>
                <p className="font-medium">{selected.applicant ? `${selected.applicant.firstName} ${selected.applicant.lastName}` : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Business Name</p>
                <p className="font-medium">{selected.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Description</p>
                <p className="text-neutral-700">{selected.businessDescription}</p>
              </div>
              {selected.portfolioUrl && (
                <div>
                  <p className="text-sm text-neutral-500">Portfolio</p>
                  <a href={selected.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">{selected.portfolioUrl}</a>
                </div>
              )}
              {selected.experience && (
                <div>
                  <p className="text-sm text-neutral-500">Experience</p>
                  <p className="text-neutral-700">{selected.experience}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Admin Notes</label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Optional notes for the applicant"
                />
              </div>
              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleReview('approved')}
                    disabled={reviewing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {reviewing ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleReview('rejected')}
                    disabled={reviewing}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    {reviewing ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              )}
              {selected.status !== 'pending' && (
                <p className="text-center text-neutral-500 text-sm">This application has already been reviewed.</p>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
