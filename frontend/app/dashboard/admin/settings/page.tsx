'use client';

import React, { useEffect, useState } from 'react';
import { useRequireRole } from '../../../../lib/with-role';
import { settingsApi, heroBannersApi } from '../../../../lib/api';
import { useToast } from '../../../../components/ui/Toast';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { Badge } from '../../../../components/ui/Badge';
import { DashboardLayout } from '../../../../components/dashboard/DashboardLayout';
import { ImageUploader } from '../../../../components/dashboard/ImageUploader';
import type { PlatformSettings, HeroBanner } from '../../../../types';

const SIDEBAR_ITEMS = [
  { href: '/dashboard/admin', label: 'Overview', icon: '📊' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/admin/orders', label: 'All Orders', icon: '📦' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: '📈' },
];

interface BannerFormData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  mediaUrl: string;
  mediaType: string;
  isActive: boolean;
  sortOrder: string;
}

const EMPTY_BANNER_FORM: BannerFormData = {
  title: '', subtitle: '', ctaText: '', ctaLink: '',
  mediaUrl: '', mediaType: 'image', isActive: true, sortOrder: '0',
};

export default function AdminSettingsPage() {
  const { user, isLoading } = useRequireRole(['admin']);
  const { toast } = useToast();

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    platformFeePercentage: '',
    designerFeePercentage: '',
    fabricSellerFeePercentage: '',
    taxPercentage: '',
  });

  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [bannerForm, setBannerForm] = useState<BannerFormData>(EMPTY_BANNER_FORM);
  const [bannerSaving, setBannerSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((s) => {
        setSettings(s);
        setSettingsForm({
          platformFeePercentage: String(s.platformFeePercentage || ''),
          designerFeePercentage: String(s.designerFeePercentage || ''),
          fabricSellerFeePercentage: String(s.fabricSellerFeePercentage || ''),
          taxPercentage: String(s.taxPercentage || ''),
        });
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));

    heroBannersApi.list()
      .then(setBanners)
      .catch(() => heroBannersApi.listActive().then(setBanners).catch(() => {}))
      .finally(() => setBannersLoading(false));
  }, []);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const updated = await settingsApi.update({
        platformFeePercentage: parseFloat(settingsForm.platformFeePercentage),
        designerFeePercentage: parseFloat(settingsForm.designerFeePercentage),
        fabricSellerFeePercentage: parseFloat(settingsForm.fabricSellerFeePercentage),
        taxPercentage: parseFloat(settingsForm.taxPercentage),
      });
      setSettings(updated);
      toast('success', 'Settings saved');
    } catch {
      toast('error', 'Failed to save settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const openCreateBanner = () => {
    setEditingBanner(null);
    setBannerForm(EMPTY_BANNER_FORM);
    setBannerModalOpen(true);
  };

  const openEditBanner = (b: HeroBanner) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      ctaText: b.ctaText || '',
      ctaLink: b.ctaLink || '',
      mediaUrl: b.mediaUrl || '',
      mediaType: b.mediaType || 'image',
      isActive: b.isActive,
      sortOrder: String(b.sortOrder),
    });
    setBannerModalOpen(true);
  };

  const handleBannerSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSaving(true);
    try {
      const payload = {
        title: bannerForm.title,
        subtitle: bannerForm.subtitle,
        ctaText: bannerForm.ctaText,
        ctaLink: bannerForm.ctaLink,
        mediaUrl: bannerForm.mediaUrl,
        mediaType: bannerForm.mediaType,
        isActive: bannerForm.isActive,
        sortOrder: parseInt(bannerForm.sortOrder, 10),
      };
      if (editingBanner) {
        const updated = await heroBannersApi.update(editingBanner.id, payload);
        setBanners((prev) => prev.map((b) => b.id === updated.id ? updated : b));
        toast('success', 'Banner updated');
      } else {
        const created = await heroBannersApi.create(payload);
        setBanners((prev) => [...prev, created]);
        toast('success', 'Banner created');
      }
      setBannerModalOpen(false);
    } catch {
      toast('error', 'Failed to save banner');
    } finally {
      setBannerSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await heroBannersApi.delete(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast('success', 'Banner deleted');
    } catch {
      toast('error', 'Failed to delete banner');
    }
  };

  const handleToggleBanner = async (b: HeroBanner) => {
    try {
      const updated = await heroBannersApi.update(b.id, { isActive: !b.isActive });
      setBanners((prev) => prev.map((x) => x.id === updated.id ? updated : x));
    } catch {
      toast('error', 'Failed to update banner status');
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <DashboardLayout sidebarItems={SIDEBAR_ITEMS} userRole={user.role} title="Platform Settings">
      {/* Fee & Tax Settings */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Fee & Tax Configuration</h2>
        {settingsLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <form onSubmit={handleSettingsSave} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Platform Fee (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settingsForm.platformFeePercentage}
                onChange={(e) => setSettingsForm((f) => ({ ...f, platformFeePercentage: e.target.value }))}
              />
              <Input
                label="Designer Fee (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settingsForm.designerFeePercentage}
                onChange={(e) => setSettingsForm((f) => ({ ...f, designerFeePercentage: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Fabric Seller Fee (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settingsForm.fabricSellerFeePercentage}
                onChange={(e) => setSettingsForm((f) => ({ ...f, fabricSellerFeePercentage: e.target.value }))}
              />
              <Input
                label="Tax Rate (%)"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settingsForm.taxPercentage}
                onChange={(e) => setSettingsForm((f) => ({ ...f, taxPercentage: e.target.value }))}
              />
            </div>
            <Button type="submit" loading={settingsSaving}>Save Settings</Button>
          </form>
        )}
      </div>

      {/* Hero Banners */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Hero Banners</h2>
          <Button size="sm" onClick={openCreateBanner}>+ Add Banner</Button>
        </div>
        {bannersLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : banners.length === 0 ? (
          <p className="text-neutral-500 text-sm">No banners configured.</p>
        ) : (
          <div className="space-y-3">
            {[...banners].sort((a, b) => a.sortOrder - b.sortOrder).map((banner) => (
              <div key={banner.id} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg">
                {banner.mediaUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={banner.mediaUrl} alt={banner.title} className="w-20 h-12 object-cover rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{banner.title}</p>
                  {banner.subtitle && <p className="text-xs text-neutral-500 truncate">{banner.subtitle}</p>}
                  <p className="text-xs text-neutral-400">Order: {banner.sortOrder}</p>
                </div>
                <Badge variant={banner.isActive ? 'success' : 'default'}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditBanner(banner)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggleBanner(banner)}>
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteBanner(banner.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banner Modal */}
      <Modal
        isOpen={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        title={editingBanner ? 'Edit Banner' : 'Add Banner'}
      >
        <form onSubmit={handleBannerSave} className="space-y-4">
          <Input label="Title" value={bannerForm.title} onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))} required />
          <Input label="Subtitle" value={bannerForm.subtitle} onChange={(e) => setBannerForm((f) => ({ ...f, subtitle: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="CTA Text" value={bannerForm.ctaText} onChange={(e) => setBannerForm((f) => ({ ...f, ctaText: e.target.value }))} placeholder="e.g. Shop Now" />
            <Input label="CTA Link" value={bannerForm.ctaLink} onChange={(e) => setBannerForm((f) => ({ ...f, ctaLink: e.target.value }))} placeholder="/products" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Sort Order" type="number" min="0" value={bannerForm.sortOrder} onChange={(e) => setBannerForm((f) => ({ ...f, sortOrder: e.target.value }))} />
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="rounded border-neutral-300"
                />
                <span className="text-sm font-medium text-neutral-700">Active</span>
              </label>
            </div>
          </div>
          <ImageUploader
            label="Banner Image"
            currentImageUrl={bannerForm.mediaUrl}
            onUpload={(url) => setBannerForm((f) => ({ ...f, mediaUrl: url }))}
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={bannerSaving} className="flex-1">Save Banner</Button>
            <Button type="button" variant="outline" onClick={() => setBannerModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
