'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import SearchInput from '../../../components/admin/SearchInput';
import FilterSelect from '../../../components/admin/FilterSelect';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import { Order } from '../../../types';

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING_PAYMENT', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'IN_PRODUCTION', label: 'In Production' },
  { value: 'SHIPPED_TO_QA', label: 'Shipped to QA' },
  { value: 'QA_INSPECTION', label: 'QA Inspection' },
  { value: 'QA_APPROVED', label: 'QA Approved' },
  { value: 'QA_REJECTED', label: 'QA Rejected' },
  { value: 'SHIPPED_TO_CUSTOMER', label: 'Shipped to Customer' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const ORDER_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'CUSTOM_DESIGN', label: 'Custom Design' },
  { value: 'READY_TO_WEAR', label: 'Ready to Wear' },
  { value: 'FABRIC_ONLY', label: 'Fabric Only' },
];

interface OrderWithCustomer extends Order {
  customer?: { firstName?: string; lastName?: string; email?: string };
}

function formatOrderType(orderType: string): string {
  return orderType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 20 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.orderType = typeFilter;
    adminApi
      .getOrders(params)
      .then((res: OrdersResponse) => {
        setOrders(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch(() => toast('error', 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    { key: 'orderNumber', header: 'Order #' },
    {
      key: 'customer',
      header: 'Customer',
      render: (row: OrderWithCustomer) => {
        if (!row.customer) return '—';
        const name = [row.customer.firstName, row.customer.lastName].filter(Boolean).join(' ');
        return name || row.customer.email || '—';
      },
    },
    {
      key: 'orderType',
      header: 'Type',
      render: (row: Order) => formatOrderType(row.orderType),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Order) => <StatusBadge status={row.status} />,
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (row: Order) => `$${(row.totalPrice ?? 0).toFixed(2)}`,
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row: Order) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Order) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Order Management" />

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search orders…"
            className="flex-1"
          />
          <FilterSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            label="Status"
          />
          <FilterSelect
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v); setPage(1); }}
            options={ORDER_TYPE_OPTIONS}
            placeholder="All Types"
            label="Type"
          />
        </div>
        <p className="text-sm text-neutral-500">{total} order{total !== 1 ? 's' : ''} found</p>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            loading={false}
            emptyMessage="No orders found"
            pagination={
              totalPages > 1
                ? { page, totalPages, onPageChange: setPage }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
