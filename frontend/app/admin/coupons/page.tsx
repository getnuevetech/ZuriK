'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { couponsApi, type Coupon } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import SearchInput from '../../../components/admin/SearchInput';
import FilterSelect from '../../../components/admin/FilterSelect';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

function getCouponStatus(coupon: Coupon): 'active' | 'expired' | 'depleted' | 'inactive' {
  if (!coupon.isActive) return 'inactive';
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return 'expired';
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return 'depleted';
  return 'active';
}

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'danger' | 'warning' | 'secondary' }> = {
  active:   { label: '🟢 Active',    variant: 'success' },
  expired:  { label: '🔴 Expired',   variant: 'danger' },
  depleted: { label: '🟡 Depleted',  variant: 'warning' },
  inactive: { label: '⚪ Inactive',  variant: 'secondary' },
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirmDeactivate, setConfirmDeactivate] = useState<Coupon | null>(null);
  const { toast } = useToast();
  const limit = 20;

  const fetchCoupons = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (search) params.search = search;
    if (statusFilter === 'active') params.active = 'true';
    if (statusFilter === 'inactive') params.active = 'false';

    couponsApi
      .list(params)
      .then((res) => {
        setCoupons(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(Math.ceil((res.total ?? 0) / limit));
      })
      .catch(() => toast('error', 'Failed to load coupons'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await couponsApi.update(coupon.id, { isActive: !coupon.isActive });
      toast('success', coupon.isActive ? 'Coupon deactivated' : 'Coupon activated');
      fetchCoupons();
    } catch {
      toast('error', 'Failed to update coupon');
    } finally {
      setConfirmDeactivate(null);
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (row: Coupon) => (
        <span className="font-mono font-semibold text-neutral-900">{row.code}</span>
      ),
    },
    {
      key: 'discountType',
      header: 'Type',
      render: (row: Coupon) => (
        <Badge variant={row.discountType === 'percentage' ? 'primary' : 'secondary'}>
          {row.discountType === 'percentage' ? 'Percentage' : 'Fixed'}
        </Badge>
      ),
    },
    {
      key: 'discountValue',
      header: 'Value',
      render: (row: Coupon) =>
        row.discountType === 'percentage'
          ? `${row.discountValue}%`
          : `₦${Number(row.discountValue).toLocaleString()}`,
    },
    {
      key: 'minimumOrderAmount',
      header: 'Min Order',
      render: (row: Coupon) =>
        row.minimumOrderAmount ? `₦${Number(row.minimumOrderAmount).toLocaleString()}` : '—',
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (row: Coupon) =>
        row.usageLimit ? `${row.usageCount}/${row.usageLimit}` : `${row.usageCount}/∞`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Coupon) => {
        const status = getCouponStatus(row);
        const badge = STATUS_BADGE[status];
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
    {
      key: 'expiryDate',
      header: 'Expires',
      render: (row: Coupon) =>
        row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Coupon) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/coupons/${row.id}/edit`}
            className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Edit
          </Link>
          <button
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              row.isActive
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
            onClick={() => setConfirmDeactivate(row)}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <Link
            href={`/admin/coupons/${row.id}/edit?tab=usage`}
            className="text-xs px-2 py-1 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Usage
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupons & Discounts"
        actions={
          <Link
            href="/admin/coupons/create"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + Create Coupon
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by code…"
            className="flex-1"
          />
          <FilterSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            label="Status"
          />
        </div>
        <p className="text-sm text-neutral-500">{total} coupon{total !== 1 ? 's' : ''} found</p>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={coupons}
            loading={false}
            emptyMessage="No coupons found"
            pagination={
              totalPages > 1
                ? { page, totalPages, onPageChange: setPage }
                : undefined
            }
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => confirmDeactivate && handleToggleActive(confirmDeactivate)}
        title={confirmDeactivate?.isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
        message={`Are you sure you want to ${confirmDeactivate?.isActive ? 'deactivate' : 'activate'} coupon "${confirmDeactivate?.code}"?`}
        confirmLabel={confirmDeactivate?.isActive ? 'Deactivate' : 'Activate'}
        variant={confirmDeactivate?.isActive ? 'danger' : 'default'}
      />
    </div>
  );
}
