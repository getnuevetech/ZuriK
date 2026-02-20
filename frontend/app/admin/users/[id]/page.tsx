'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import StatusBadge from '../../../../components/admin/StatusBadge';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { Select } from '../../../../components/ui/Select';
import { useToast } from '../../../../components/ui/Toast';
import { User } from '../../../../types';

interface UserDetailData extends User {
  city?: string;
  country?: string;
  orderCount?: number;
}

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'designer', label: 'Designer' },
  { value: 'fabric_seller', label: 'Fabric Seller' },
  { value: 'qa', label: 'QA' },
  { value: 'admin', label: 'Admin' },
];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    adminApi
      .getUser(id)
      .then((data: UserDetailData) => {
        setUser(data);
        setSelectedRole(data.role);
      })
      .catch(() => toast('error', 'Failed to load user'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleRoleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await adminApi.updateUserRole(user.id, selectedRole);
      setUser((prev: UserDetailData | null) => prev ? { ...prev, role: selectedRole as User['role'] } : prev);
      toast('success', 'Role updated');
      setRoleModalOpen(false);
    } catch {
      toast('error', 'Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await adminApi.updateUserStatus(user.id, !user.isActive);
      setUser((prev: UserDetailData | null) => prev ? { ...prev, isActive: !prev.isActive } : prev);
      toast('success', `User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast('error', 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <p className="text-neutral-500">User not found.</p>;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User Detail"
        breadcrumbs={[
          { label: 'Users', href: '/admin/users' },
          { label: 'Detail' },
        ]}
      />

      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-neutral-900">
              {user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email}
            </h2>
            <p className="text-sm text-neutral-500">{user.email}</p>
            {(user.city || user.country) && (
              <p className="text-sm text-neutral-500">
                {[user.city, user.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
          <StatusBadge status={user.isActive ? 'ACTIVE' : 'INACTIVE'} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Role</p>
            <p className="text-sm font-medium text-neutral-800 capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Orders</p>
            <p className="text-sm font-medium text-neutral-800">{user.orderCount ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Joined</p>
            <p className="text-sm font-medium text-neutral-800">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400 uppercase tracking-wide">Updated</p>
            <p className="text-sm font-medium text-neutral-800">
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => setRoleModalOpen(true)}>
            Change Role
          </Button>
          <Button
            variant={user.isActive ? 'danger' : 'primary'}
            size="sm"
            loading={saving}
            onClick={handleToggleStatus}
          >
            {user.isActive ? 'Deactivate User' : 'Activate User'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/users')}>
            ← Back to Users
          </Button>
        </div>
      </div>

      <Modal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} title="Change Role">
        <div className="space-y-4">
          <Select
            label="New Role"
            options={ROLE_OPTIONS}
            value={selectedRole}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRole(e.target.value)}
            placeholder="Select role"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleRoleSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
