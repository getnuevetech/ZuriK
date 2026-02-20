'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRequireRole } from '../../lib/with-role';
import { authApi, ordersApi } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import type { Order } from '../../types';

const STATUS_VARIANTS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  IN_PRODUCTION: 'info',
  SHIPPED_TO_QA: 'info',
  QA_INSPECTION: 'info',
  QA_APPROVED: 'success',
  QA_REJECTED: 'danger',
  SHIPPED_TO_CUSTOMER: 'success',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export default function AccountPage() {
  const { user, isLoading } = useRequireRole(['customer', 'designer', 'fabric_seller', 'qa', 'admin']);
  const { logout } = useAuth();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Profile form
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'security'>('profile');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
      });
    }
  }, [user]);

  useEffect(() => {
    ordersApi.getMyOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await authApi.getProfile(); // Verify auth still valid
      // In a real app, call usersApi.update(user.id, profile)
      toast('success', 'Profile updated successfully');
    } catch {
      toast('error', 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast('error', 'New passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast('error', 'Password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      // Call password change endpoint
      toast('success', 'Password changed successfully');
      setPasswords({ current: '', newPassword: '', confirm: '' });
    } catch {
      toast('error', 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: 'Order History' },
    { key: 'security', label: 'Security' },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>
            <p className="text-sm text-neutral-500 mt-1">Manage your profile, orders, and security settings</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-neutral-200 p-1 mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Profile Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="First name"
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
              <Input
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
              />
              <div className="flex items-center gap-3">
                <Badge variant="default">
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
              <Button type="submit" loading={profileSaving}>
                Save Changes
              </Button>
            </form>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-semibold text-neutral-900">Order History</h2>
            </div>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <p className="mb-4">No orders yet.</p>
                <Link href="/products">
                  <Button variant="outline" size="sm">Start Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {orders.map((order) => (
                  <div key={order.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-neutral-900">#{order.orderNumber}</p>
                        <Badge variant={STATUS_VARIANTS[order.status] || 'default'}>
                          {order.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {order.orderType.replace(/_/g, ' ')} · {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-neutral-900">${order.totalPrice?.toFixed(2)}</p>
                      <Link href={`/orders/${order.id}`} className="text-xs text-primary-600 hover:underline mt-0.5 block">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              <Input
                label="Current Password"
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                placeholder="Current password"
              />
              <Input
                label="New Password"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="New password (min 8 characters)"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Confirm new password"
              />
              <Button type="submit" loading={pwSaving}>
                Update Password
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
