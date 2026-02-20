'use client';

import React, { useEffect, useState } from 'react';
import { homepageAdminApi } from '../../../../lib/api';
import AdminPageHeader from '../../../../components/admin/AdminPageHeader';
import { Spinner } from '../../../../components/ui/Spinner';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { useToast } from '../../../../components/ui/Toast';

interface HeroImage {
  url: string;
  alt: string;
  caption: string;
}

interface CountryHero {
  id: string;
  countryCode: string;
  countryName: string;
  flagUrl: string | null;
  heroImages: HeroImage[];
  rotationInterval: number;
  transitionStyle: string;
  displayOrder: number;
  isActive: boolean;
}

const TRANSITIONS = ['FADE', 'SLIDE', 'CROSSFADE'];

export default function AdminCountriesPage() {
  const [heroes, setHeroes] = useState<CountryHero[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newFlag, setNewFlag] = useState('');
  const [newRotation, setNewRotation] = useState(5);
  const [newTransition, setNewTransition] = useState('FADE');
  // For adding images
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgCaption, setImgCaption] = useState('');
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    homepageAdminApi
      .getCountryHeroes()
      .then((r) => setHeroes(r.data ?? []))
      .catch(() => toast('error', 'Failed to load country heroes'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    if (!newCode.trim() || !newName.trim()) return;
    setCreating(true);
    try {
      await homepageAdminApi.createCountryHero({
        countryCode: newCode.toUpperCase(),
        countryName: newName,
        flagUrl: newFlag || undefined,
        rotationInterval: newRotation,
        transitionStyle: newTransition,
      });
      setNewCode(''); setNewName(''); setNewFlag(''); setNewRotation(5); setNewTransition('FADE');
      toast('success', 'Country hero created');
      load();
    } catch {
      toast('error', 'Failed to create country hero');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (hero: CountryHero) => {
    try {
      await homepageAdminApi.updateCountryHero(hero.id, { isActive: !hero.isActive });
      load();
    } catch {
      toast('error', 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this country hero?')) return;
    try {
      await homepageAdminApi.deleteCountryHero(id);
      toast('success', 'Deleted');
      load();
    } catch {
      toast('error', 'Failed to delete');
    }
  };

  const handleAddImage = async (heroId: string) => {
    if (!imgUrl.trim()) return;
    try {
      await homepageAdminApi.addCountryHeroImage(heroId, { url: imgUrl, alt: imgAlt, caption: imgCaption });
      setImgUrl(''); setImgAlt(''); setImgCaption('');
      toast('success', 'Image added');
      load();
    } catch {
      toast('error', 'Failed to add image');
    }
  };

  const handleRemoveImage = async (heroId: string, index: number) => {
    if (!confirm('Remove this image?')) return;
    try {
      await homepageAdminApi.removeCountryHeroImage(heroId, index);
      toast('success', 'Image removed');
      load();
    } catch {
      toast('error', 'Failed to remove image');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Country Hero Images" />

      {/* Create form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">Add Country</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Country Code (e.g. NG)" value={newCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCode(e.target.value)} placeholder="NG" />
          <Input label="Country Name" value={newName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} placeholder="Nigeria" />
          <Input label="Flag URL (optional)" value={newFlag} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFlag(e.target.value)} placeholder="https://..." />
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Transition Style</label>
            <select
              value={newTransition}
              onChange={(e) => setNewTransition(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TRANSITIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Rotation Interval (seconds)</label>
            <input
              type="number"
              min={1}
              value={newRotation}
              onChange={(e) => setNewRotation(Number(e.target.value))}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" size="md" loading={creating} onClick={handleCreate}>Add Country</Button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {heroes.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No country heroes yet. Add one above.
          </div>
        )}
        {heroes.map((hero) => (
          <div key={hero.id} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
            <div className="flex items-center gap-3">
              {hero.flagUrl && <img src={hero.flagUrl} alt={hero.countryCode} className="h-6 w-9 object-cover rounded" />}
              <div className="flex-1">
                <span className="font-semibold text-neutral-800">{hero.countryName}</span>
                <span className="ml-2 text-xs text-neutral-500 font-mono">{hero.countryCode}</span>
              </div>
              <span className="text-xs text-neutral-400">{hero.heroImages.length} image{hero.heroImages.length !== 1 ? 's' : ''}</span>
              <button
                role="switch"
                aria-checked={hero.isActive}
                onClick={() => handleToggle(hero)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${hero.isActive ? 'bg-indigo-600' : 'bg-neutral-300'}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${hero.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <button onClick={() => setExpandedId(expandedId === hero.id ? null : hero.id)} className="text-sm text-indigo-600 hover:underline">
                {expandedId === hero.id ? 'Collapse' : 'Manage Images'}
              </button>
              <button onClick={() => handleDelete(hero.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
            </div>

            {expandedId === hero.id && (
              <div className="border-t border-neutral-100 pt-3 space-y-3">
                {/* Existing images */}
                {hero.heroImages.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {hero.heroImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img.url} alt={img.alt} className="h-20 w-28 object-cover rounded-lg border border-neutral-200" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                          <button onClick={() => handleRemoveImage(hero.id, idx)} className="text-white text-xs bg-red-600 rounded px-2 py-1">Remove</button>
                        </div>
                        {img.caption && <p className="text-xs text-neutral-500 mt-1 max-w-[112px] truncate">{img.caption}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add image form */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input label="Image URL" value={imgUrl} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImgUrl(e.target.value)} placeholder="https://..." />
                  <Input label="Alt text" value={imgAlt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImgAlt(e.target.value)} placeholder="Nigerian fashion" />
                  <Input label="Caption" value={imgCaption} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImgCaption(e.target.value)} placeholder="Explore Nigerian Styles" />
                </div>
                <div className="flex justify-end">
                  <Button variant="secondary" size="sm" onClick={() => handleAddImage(hero.id)}>Add Image</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
