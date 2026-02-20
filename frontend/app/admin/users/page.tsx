'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import StatusBadge from '../../../components/admin/StatusBadge';
import SearchInput from '../../../components/admin/SearchInput';
import FilterSelect from '../../../components/admin/FilterSelect';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import { User } from '../../../types';

interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  totalPages: number;
}

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'designer', label: 'Designer' },
  { value: 'fabric_seller', label: 'Fabric Seller' },
  { value: 'qa', label: 'QA' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_CHANGE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'designer', label: 'Designer' },
  { value: 'fabric_seller', label: 'Fabric Seller' },
  { value: 'qa', label: 'QA' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirmToggle, setConfirmToggle] = useState<{ user: User } | null>(null);
  const [roleEditMap, setRoleEditMap] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 20 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    adminApi
      .getUsers(params)
      .then((res: UsersResponse) => {
        setUsers(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
      })
      .catch(() => toast('error', 'Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await adminApi.updateUserRole(user.id, newRole);
      toast('success', `Role updated to ${newRole}`);
      fetchUsers();
    } catch {
      toast('error', 'Failed to update role');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      toast('success', `User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast('error', 'Failed to update status');
    } finally {
      setConfirmToggle(null);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row: User) =>
        row.firstName ? `${row.firstName} ${row.lastName ?? ''}`.trim() : '—',
    },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (row: User) => {
        const currentVal = roleEditMap[row.id] ?? row.role;
        return (
          <select
            className="border border-neutral-200 rounded px-2 py-1 text-sm"
            value={currentVal}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setRoleEditMap((prev: Record<string, string>) => ({ ...prev, [row.id]: e.target.value }));
              handleRoleChange(row, e.target.value);
            }}
          >
            {ROLE_CHANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (row: User) => (
        <StatusBadge status={row.isActive ? 'ACTIVE' : 'INACTIVE'} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (row: User) =>
        row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: User) => (
        <div className="flex items-center gap-2">
          <button
            className={`text-xs px-2 py-1 rounded border transition-colors ${
              row.isActive
                ? 'border-red-200 text-red-600 hover:bg-red-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            }`}
            onClick={() => setConfirmToggle({ user: row })}
          >
            {row.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <Link
            href={`/admin/users/${row.id}`}
            className="text-xs px-2 py-1 rounded border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="User Management" />

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by name or email…"
            className="flex-1"
          />
          <FilterSelect
            value={roleFilter}
            onChange={(v) => { setRoleFilter(v); setPage(1); }}
            options={ROLE_OPTIONS}
            placeholder="All Roles"
            label="Role"
          />
        </div>
        <p className="text-sm text-neutral-500">{total} user{total !== 1 ? 's' : ''} found</p>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            loading={false}
            emptyMessage="No users found"
            pagination={
              totalPages > 1
                ? { page, totalPages, onPageChange: setPage }
                : undefined
            }
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmToggle}
        onClose={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && handleToggleStatus(confirmToggle.user)}
        title={confirmToggle?.user.isActive ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${confirmToggle?.user.isActive ? 'deactivate' : 'activate'} this user?`}
        confirmLabel={confirmToggle?.user.isActive ? 'Deactivate' : 'Activate'}
        variant={confirmToggle?.user.isActive ? 'danger' : 'default'}
      />
    </div>
  );
}
