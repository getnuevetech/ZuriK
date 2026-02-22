'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { designsApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Badge } from '../../../components/ui/Badge';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import type { Design } from '../../../types';

export default function DesignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    designsApi.getById(id)
      .then(setDesign)
      .catch(() => router.push('/designs'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }
  if (!design) return null;

  const images = design.images || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-50 mb-4">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={design.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🎨</div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx ? 'border-indigo-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${design.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              {design.category && <Badge variant="secondary">{design.category}</Badge>}
              <Badge variant="info">Custom Order</Badge>
            </div>

            <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">{design.name}</h1>

            {design.designer && (
              <p className="text-sm text-neutral-500 mb-4">
                by <span className="font-medium text-neutral-700">{design.designer.firstName} {design.designer.lastName}</span>
                {design.designer.country && ` • ${design.designer.country}`}
              </p>
            )}

            <PriceDisplay amount={design.customerPrice} className="text-2xl font-bold text-indigo-600 mb-4" />

            <p className="text-neutral-600 leading-relaxed mb-6">{design.description}</p>

            {design.tags && design.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {design.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full">{tag}</span>
                ))}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800 font-medium mb-1">📏 Custom Made to Your Measurements</p>
              <p className="text-xs text-amber-700">
                This is a design template. You'll enter your measurements when placing an order,
                and choose your own fabric or let the designer select one for you.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              <Button
                size="lg"
                className="w-full"
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect=/orders/custom-design?designId=${design.id}`);
                  } else {
                    router.push(`/orders/custom-design?designId=${design.id}`);
                  }
                }}
              >
                Start Custom Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
