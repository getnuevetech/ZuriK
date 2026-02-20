'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { usersApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Modal } from '../../../../components/ui/Modal';
import { Badge } from '../../../../components/ui/Badge';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import type { User } from '../../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: '📊' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/orders', label: 'All Orders', icon: '📦' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
];

const ROLE_OPTIONS = [
  { value: 'customer', label: 'Customer' },
  { value: 'designer', label: 'Designer' },
  { value: 'fabric_seller', label: 'Fabric Seller' },
  { value: 'qa', label: 'QA' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All Roles' },
  ...ROLE_OPTIONS,
];

interface AddUserForm {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

export default function AdminUsersPage() {
  const { user, isLoading } = useRequireRole(['admin']);
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddUserForm>({ email: '', firstName: '', lastName: '', password: '', role: 'customer' });
  const [addSaving, setAddSaving] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const loadUsers = () => {
    usersApi.list(roleFilter ? { role: roleFilter } : undefined)
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [roleFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleActive = async (u: User) => {
    try {
      const updated = await usersApi.toggleActive(u.id, !u.isActive);
      setUsers((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      toast('success', `User ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast('error', 'Failed to update user status');
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    setChangingRole(userId);
    try {
      const updated = await usersApi.changeRole(userId, role);
      setUsers((prev) => prev.map((x) => x.id === updated.id ? updated : x));
      toast('success', 'Role updated');
    } catch {
      toast('error', 'Failed to change role');
    } finally {
      setChangingRole(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await usersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast('success', 'User deleted');
    } catch {
      toast('error', 'Failed to delete user');
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSaving(true);
    try {
      const newUser = await usersApi.create({
        ...addForm,
        isActive: true,
        role: addForm.role as User['role'],
      });
      setUsers((prev) => [newUser, ...prev]);
      setAddModalOpen(false);
      setAddForm({ email: '', firstName: '', lastName: '', password: '', role: 'customer' });
      toast('success', 'User created');
    } catch {
      toast('error', 'Failed to create user');
    } finally {
      setAddSaving(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.firstName || '').toLowerCase().includes(q) ||
      (u.lastName || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="User Management">
      <div className="flex flex-wrap gap-4 mb-4 items-end">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-44">
          <Select
            options={ROLE_FILTER_OPTIONS}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            placeholder="Filter by role"
          />
        </div>
        <Button onClick={() => setAddModalOpen(true)}>+ Add User</Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">No users found.</td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        disabled={changingRole === u.id}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="border border-neutral-300 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? 'success' : 'danger'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={u.isActive ? 'outline' : 'secondary'}
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add New User">
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={addForm.firstName} onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))} />
            <Input label="Last Name" value={addForm.lastName} onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))} />
          </div>
          <Input label="Email" type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} required />
          <Input label="Password" type="password" value={addForm.password} onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} required />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={addForm.role}
            onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={addSaving} className="flex-1">Create User</Button>
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
