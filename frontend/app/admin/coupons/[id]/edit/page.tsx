'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { couponsApi, type Coupon } from '../../../../../lib/api';
import AdminPageHeader from '../../../../../components/admin/AdminPageHeader';
import { Button } from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import { Textarea } from '../../../../../components/ui/Textarea';
import { Card, CardBody, CardHeader } from '../../../../../components/ui/Card';
import { Spinner } from '../../../../../components/ui/Spinner';
import { useToast } from '../../../../../components/ui/Toast';
import { useCurrency } from '../../../../../lib/currency-context';

function toDatetimeLocal(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscount: '',
    startDate: '',
    expiryDate: '',
    usageLimit: '',
    perUserLimit: '',
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    couponsApi
      .getOne(id)
      .then((c) => {
        setCoupon(c);
        setForm({
          code: c.code,
          discountType: c.discountType,
          discountValue: String(c.discountValue),
          minimumOrderAmount: c.minimumOrderAmount !== null ? String(c.minimumOrderAmount) : '',
          maximumDiscount: c.maximumDiscount !== null ? String(c.maximumDiscount) : '',
          startDate: toDatetimeLocal(c.startDate),
          expiryDate: toDatetimeLocal(c.expiryDate),
          usageLimit: c.usageLimit !== null ? String(c.usageLimit) : '',
          perUserLimit: c.perUserLimit !== null ? String(c.perUserLimit) : '',
          description: c.description ?? '',
          isActive: c.isActive,
        });
      })
      .catch(() => toast('error', 'Failed to load coupon'))
      .finally(() => setPageLoading(false));
  }, [id, toast]);

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Coupon code is required';
    if (!form.discountValue) newErrors.discountValue = 'Discount value is required';
    const val = parseFloat(form.discountValue);
    if (isNaN(val) || val < 0) newErrors.discountValue = 'Must be a positive number';
    if (form.discountType === 'percentage' && val > 100)
      newErrors.discountValue = 'Percentage must be between 0 and 100';
    if (form.startDate && form.expiryDate && new Date(form.expiryDate) <= new Date(form.startDate))
      newErrors.expiryDate = 'Expiry date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await couponsApi.update(id, {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minimumOrderAmount: form.minimumOrderAmount ? parseFloat(form.minimumOrderAmount) : undefined,
        maximumDiscount: form.maximumDiscount ? parseFloat(form.maximumDiscount) : undefined,
        startDate: form.startDate || undefined,
        expiryDate: form.expiryDate || undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
        perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : undefined,
        description: form.description || undefined,
        isActive: form.isActive,
      });
      toast('success', 'Coupon updated successfully');
      router.push('/admin/coupons');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg?.includes('already exists')) {
        setErrors((prev) => ({ ...prev, code: msg }));
      } else {
        toast('error', msg || 'Failed to update coupon');
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (!coupon) return null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Edit Coupon: ${coupon.code}`}
        breadcrumbs={[
          { label: 'Coupons', href: '/admin/coupons' },
          { label: coupon.code },
        ]}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-neutral-800">Coupon Details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input
              label="Coupon Code *"
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              placeholder="e.g. SAVE20"
              error={errors.code}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Discount Type *
              </label>
              <select
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={form.discountType}
                onChange={(e) => set('discountType', e.target.value)}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ({currencySymbol})</option>
              </select>
            </div>

            <Input
              label={`Discount Value * ${form.discountType === 'percentage' ? '(%)' : `(${currencySymbol})`}`}
              type="number"
              min="0"
              max={form.discountType === 'percentage' ? '100' : undefined}
              step="0.01"
              value={form.discountValue}
              onChange={(e) => set('discountValue', e.target.value)}
              error={errors.discountValue}
            />

            <Input
              label={`Minimum Order Amount (${currencySymbol}, optional)`}
              type="number"
              min="0"
              step="0.01"
              value={form.minimumOrderAmount}
              onChange={(e) => set('minimumOrderAmount', e.target.value)}
            />

            {form.discountType === 'percentage' && (
              <Input
                label={`Maximum Discount Cap (${currencySymbol}, optional)`}
                type="number"
                min="0"
                step="0.01"
                value={form.maximumDiscount}
                onChange={(e) => set('maximumDiscount', e.target.value)}
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-neutral-800">Validity & Limits</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date (optional)"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
              <Input
                label="Expiry Date (optional)"
                type="datetime-local"
                value={form.expiryDate}
                onChange={(e) => set('expiryDate', e.target.value)}
                error={errors.expiryDate}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Total Usage Limit (optional)"
                type="number"
                min="1"
                step="1"
                value={form.usageLimit}
                onChange={(e) => set('usageLimit', e.target.value)}
              />
              <Input
                label="Per User Limit (optional)"
                type="number"
                min="1"
                step="1"
                value={form.perUserLimit}
                onChange={(e) => set('perUserLimit', e.target.value)}
              />
            </div>

            <Textarea
              label="Description (optional)"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={2}
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-neutral-700">Active</span>
            </label>
          </CardBody>
        </Card>

        <div className="flex gap-3">
          <Link href="/admin/coupons">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
