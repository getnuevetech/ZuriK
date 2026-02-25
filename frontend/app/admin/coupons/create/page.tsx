'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { couponsApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Textarea } from '../../../../components/ui/Textarea';
import { Card, CardBody, CardHeader } from '../../../../components/ui/Card';
import { useToast } from '../../../../components/ui/Toast';
import { useCurrency } from '../../../../lib/currency-context';

export default function CreateCouponPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currencySymbol } = useCurrency();

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
      await couponsApi.create({
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
      toast('success', 'Coupon created successfully');
      router.push('/admin/coupons');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg?.includes('already exists')) {
        setErrors((prev) => ({ ...prev, code: msg }));
      } else {
        toast('error', msg || 'Failed to create coupon');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create Coupon"
        breadcrumbs={[
          { label: 'Coupons', href: '/admin/coupons' },
          { label: 'Create' },
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
              placeholder={form.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 500'}
              error={errors.discountValue}
            />

            <Input
              label={`Minimum Order Amount (${currencySymbol}, optional)`}
              type="number"
              min="0"
              step="0.01"
              value={form.minimumOrderAmount}
              onChange={(e) => set('minimumOrderAmount', e.target.value)}
              placeholder="e.g. 5000"
            />

            {form.discountType === 'percentage' && (
              <Input
                label={`Maximum Discount Cap (${currencySymbol}, optional)`}
                type="number"
                min="0"
                step="0.01"
                value={form.maximumDiscount}
                onChange={(e) => set('maximumDiscount', e.target.value)}
                placeholder="e.g. 2000"
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
                placeholder="e.g. 100"
              />
              <Input
                label="Per User Limit (optional)"
                type="number"
                min="1"
                step="1"
                value={form.perUserLimit}
                onChange={(e) => set('perUserLimit', e.target.value)}
                placeholder="e.g. 1"
              />
            </div>

            <Textarea
              label="Description (optional)"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe when and how this coupon can be used…"
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
          <Button type="submit" loading={loading}>Create Coupon</Button>
        </div>
      </form>
    </div>
  );
}
