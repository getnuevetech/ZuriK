'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { homepageApi, uploadApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { useToast } from '../../../../components/ui/Toast';

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('');
}

const AFRICAN_COUNTRIES = [
  { name: 'Algeria', code: 'DZ' },
  { name: 'Angola', code: 'AO' },
  { name: 'Benin', code: 'BJ' },
  { name: 'Botswana', code: 'BW' },
  { name: 'Burkina Faso', code: 'BF' },
  { name: 'Burundi', code: 'BI' },
  { name: 'Cameroon', code: 'CM' },
  { name: 'Cape Verde', code: 'CV' },
  { name: 'Central African Republic', code: 'CF' },
  { name: 'Chad', code: 'TD' },
  { name: 'Comoros', code: 'KM' },
  { name: 'DR Congo', code: 'CD' },
  { name: 'Republic of Congo', code: 'CG' },
  { name: 'Djibouti', code: 'DJ' },
  { name: 'Egypt', code: 'EG' },
  { name: 'Equatorial Guinea', code: 'GQ' },
  { name: 'Eritrea', code: 'ER' },
  { name: 'Eswatini', code: 'SZ' },
  { name: 'Ethiopia', code: 'ET' },
  { name: 'Gabon', code: 'GA' },
  { name: 'Gambia', code: 'GM' },
  { name: 'Ghana', code: 'GH' },
  { name: 'Guinea', code: 'GN' },
  { name: 'Guinea-Bissau', code: 'GW' },
  { name: 'Ivory Coast', code: 'CI' },
  { name: 'Kenya', code: 'KE' },
  { name: 'Lesotho', code: 'LS' },
  { name: 'Liberia', code: 'LR' },
  { name: 'Libya', code: 'LY' },
  { name: 'Madagascar', code: 'MG' },
  { name: 'Malawi', code: 'MW' },
  { name: 'Mali', code: 'ML' },
  { name: 'Mauritania', code: 'MR' },
  { name: 'Mauritius', code: 'MU' },
  { name: 'Morocco', code: 'MA' },
  { name: 'Mozambique', code: 'MZ' },
  { name: 'Namibia', code: 'NA' },
  { name: 'Niger', code: 'NE' },
  { name: 'Nigeria', code: 'NG' },
  { name: 'Rwanda', code: 'RW' },
  { name: 'São Tomé and Príncipe', code: 'ST' },
  { name: 'Senegal', code: 'SN' },
  { name: 'Seychelles', code: 'SC' },
  { name: 'Sierra Leone', code: 'SL' },
  { name: 'Somalia', code: 'SO' },
  { name: 'South Africa', code: 'ZA' },
  { name: 'South Sudan', code: 'SS' },
  { name: 'Sudan', code: 'SD' },
  { name: 'Tanzania', code: 'TZ' },
  { name: 'Togo', code: 'TG' },
  { name: 'Tunisia', code: 'TN' },
  { name: 'Uganda', code: 'UG' },
  { name: 'Zambia', code: 'ZM' },
  { name: 'Zimbabwe', code: 'ZW' },
].map((c) => ({ ...c, flag: countryCodeToFlag(c.code) }));

interface CountryHero {
  id: string;
  countryName: string;
  countryCode: string;
  heroImages: string[];
  flag: string;
  fabrics: string[];
  subtitle: string;
  rotationInterval: number;
  displayOrder: number;
  isActive: boolean;
}

const emptyForm = (): Omit<CountryHero, 'id'> => ({
  countryName: '',
  countryCode: '',
  heroImages: [],
  flag: '',
  fabrics: [],
  subtitle: '',
  rotationInterval: 5000,
  displayOrder: 0,
  isActive: true,
});

export default function AdminCountriesPage() {
  const [countries, setCountries] = useState<CountryHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [sectionSettings, setSectionSettings] = useState({ scrollSpeed: 4000, aspectRatio: '6/5', autoScrollEnabled: true });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await homepageApi.adminGetCountries();
      setCountries(data as CountryHero[]);
    } catch {
      toast('error', 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCountries();
    homepageApi.adminGetShopByCountrySettings()
      .then((data) => { if (data) setSectionSettings(data); })
      .catch(() => {});
  }, [fetchCountries]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await homepageApi.adminUpdateShopByCountrySettings(sectionSettings as unknown as Record<string, unknown>);
      toast('success', 'Settings saved');
    } catch {
      toast('error', 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm());
    setCountrySearch('');
    setShowForm(true);
  };

  const openEdit = (c: CountryHero) => {
    setEditId(c.id);
    setForm({
      countryName: c.countryName,
      countryCode: c.countryCode,
      heroImages: c.heroImages ?? [],
      flag: c.flag ?? '',
      fabrics: c.fabrics ?? [],
      subtitle: c.subtitle ?? '',
      rotationInterval: c.rotationInterval,
      displayOrder: c.displayOrder,
      isActive: c.isActive,
    });
    setCountrySearch(c.countryName);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadApi.uploadImage(file);
      setForm((prev) => ({ ...prev, heroImages: [...prev.heroImages, url] }));
      toast('success', 'Image uploaded');
    } catch {
      toast('error', 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      heroImages: prev.heroImages.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!form.countryName.trim() || !form.countryCode.trim()) {
      toast('error', 'Country name and code are required');
      return;
    }
    if (!editId && countries.some((c) => c.countryCode === form.countryCode)) {
      toast('error', `A country hero for ${form.countryName} (${form.countryCode}) already exists`);
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await homepageApi.adminUpdateCountry(editId, form as unknown as Record<string, unknown>);
        toast('success', 'Country updated');
      } else {
        await homepageApi.adminCreateCountry(form as unknown as Record<string, unknown>);
        toast('success', 'Country created');
      }
      setShowForm(false);
      fetchCountries();
    } catch {
      toast('error', 'Failed to save country');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this country hero?')) return;
    try {
      await homepageApi.adminDeleteCountry(id);
      toast('success', 'Country deleted');
      fetchCountries();
    } catch {
      toast('error', 'Failed to delete country');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Country Category Heroes" />

      {/* Section Settings Panel */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-800">Section Display Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Auto-Scroll Speed (ms)</label>
            <input
              type="number"
              min={1000}
              step={500}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              value={sectionSettings.scrollSpeed}
              onChange={(e) => setSectionSettings((prev) => ({ ...prev, scrollSpeed: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Image Aspect Ratio</label>
            <select
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              value={sectionSettings.aspectRatio}
              onChange={(e) => setSectionSettings((prev) => ({ ...prev, aspectRatio: e.target.value }))}
            >
              <option value="3/2">3:2 (Original)</option>
              <option value="6/5">6:5 (20% shorter)</option>
              <option value="16/10">16:10</option>
              <option value="16/9">16:9 (Widescreen)</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-medium text-neutral-600 mb-1">Auto-Scroll</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sectionSettings.autoScrollEnabled}
                onChange={(e) => setSectionSettings((prev) => ({ ...prev, autoScrollEnabled: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-neutral-700">Enabled</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {savingSettings ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Country
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {countries.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500 text-center">No country heroes yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  {['Country', 'Code', 'Flag', 'Fabrics', 'Images', 'Order', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {countries.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-800">{c.countryName}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.countryCode}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.flag || '—'}</td>
                    <td className="px-4 py-3 text-neutral-500">{c.fabrics?.length ?? 0} types</td>
                    <td className="px-4 py-3 text-neutral-500">{c.heroImages?.length ?? 0} images</td>
                    <td className="px-4 py-3 text-neutral-500">{c.displayOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                        {c.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-neutral-800">
              {editId ? 'Edit Country' : 'New Country Hero'}
            </h2>

            <div className="space-y-3">
              {/* Country selector combobox */}
              <div ref={comboboxRef} className="relative">
                <label className="block text-xs font-medium text-neutral-600 mb-1">Country Name *</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search country…"
                  autoComplete="off"
                />
                {dropdownOpen && (
                  <ul className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {AFRICAN_COUNTRIES.filter((c) =>
                      c.name.toLowerCase().includes(countrySearch.toLowerCase())
                    ).length === 0 ? (
                      <li className="px-3 py-2 text-sm text-neutral-400">No countries found</li>
                    ) : (
                      AFRICAN_COUNTRIES.filter((c) =>
                        c.name.toLowerCase().includes(countrySearch.toLowerCase())
                      ).map((c) => (
                        <li
                          key={c.code}
                          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50"
                          onMouseDown={() => {
                            setForm((prev) => ({ ...prev, countryName: c.name, countryCode: c.code, flag: c.flag }));
                            setCountrySearch(c.name);
                            setDropdownOpen(false);
                          }}
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                          <span className="ml-auto text-xs text-neutral-400">{c.code}</span>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Country Code</label>
                  <input
                    readOnly
                    disabled
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
                    value={form.countryCode}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Flag Emoji</label>
                  <input
                    readOnly
                    disabled
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
                    value={form.flag}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Subtitle (optional)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. West African fashion hub"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Fabrics (comma-separated, e.g. Ankara, Adire)</label>
                <input
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  value={form.fabrics.join(', ')}
                  onChange={(e) => setForm({ ...form, fabrics: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Ankara, Adire, Aso-Oke"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Hero Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.heroImages.map((url, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="hero" className="w-16 h-16 object-cover rounded-lg" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500 hover:border-indigo-400 transition-colors">
                  {uploading ? <Spinner /> : '📷 Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Rotation Interval (ms)</label>
                  <input
                    type="number"
                    min={1000}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.rotationInterval}
                    onChange={(e) => setForm({ ...form, rotationInterval: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Display Order</label>
                  <input
                    type="number"
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-neutral-700">Active</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
