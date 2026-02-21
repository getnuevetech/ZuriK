'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { sellerApplicationsApi, type SellerApplication } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    requestedRole: 'designer' as 'designer' | 'fabric_seller',
    businessName: '',
    businessDescription: '',
    portfolioUrl: '',
    experience: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/become-seller');
      return;
    }
    if (user?.role !== 'customer') {
      router.push('/dashboard/' + (user?.role === 'designer' ? 'designer' : user?.role === 'fabric_seller' ? 'fabric-seller' : ''));
      return;
    }
    fetchApplications();
  }, [isAuthenticated, authLoading, user]);

  async function fetchApplications() {
    try {
      const data = await sellerApplicationsApi.getMyApplications();
      setApplications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const hasPending = applications.some((a) => a.status === 'pending');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasPending) {
      toast('warning', 'Already Applied: You already have a pending application.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        portfolioUrl: form.portfolioUrl || undefined,
        experience: form.experience || undefined,
      };
      await sellerApplicationsApi.apply(payload);
      toast('success', 'Application Submitted: Your seller application has been submitted for review.');
      await fetchApplications();
      setForm({ requestedRole: 'designer', businessName: '', businessDescription: '', portfolioUrl: '', experience: '' });
    } catch (err: any) {
      toast('error', err?.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">Become a Seller</h1>
      <p className="text-neutral-600 mb-8">Apply to become a Designer or Fabric Seller on our platform.</p>

      {applications.length > 0 && (
        <Card className="mb-8">
          <CardHeader><h2 className="text-lg font-semibold">Your Applications</h2></CardHeader>
          <CardBody>
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-900">{app.businessName}</p>
                    <p className="text-sm text-neutral-500 capitalize">{app.requestedRole.replace('_', ' ')}</p>
                    {app.adminNotes && (
                      <p className="text-sm text-neutral-600 mt-1">Note: {app.adminNotes}</p>
                    )}
                  </div>
                  <Badge variant={STATUS_COLORS[app.status] || 'default'} className="capitalize">{app.status}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {!hasPending && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold">Submit Application</h2></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Apply As</label>
                <select
                  value={form.requestedRole}
                  onChange={(e) => setForm({ ...form, requestedRole: e.target.value as 'designer' | 'fabric_seller' })}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="designer">Fashion Designer</option>
                  <option value="fabric_seller">Fabric Seller</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your business or brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Business Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.businessDescription}
                  onChange={(e) => setForm({ ...form, businessDescription: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your business, products, and what makes you unique"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Portfolio URL</label>
                <input
                  type="url"
                  value={form.portfolioUrl}
                  onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://yourportfolio.com (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Experience</label>
                <textarea
                  rows={3}
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe your experience (years, previous work, etc.) — optional"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {hasPending && (
        <Card>
          <CardBody>
            <div className="text-center py-6">
              <div className="text-4xl mb-3">⏳</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Application Under Review</h3>
              <p className="text-neutral-600">Your application is currently being reviewed by our team. We&apos;ll notify you once a decision has been made.</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
