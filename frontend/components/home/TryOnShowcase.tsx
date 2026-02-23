'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageApi } from '../../lib/api';

const FEATURES = [
  { num: '①', label: 'Choose Fabric', desc: 'Select from hundreds of authentic African textiles' },
  { num: '②', label: 'Visualise Design', desc: 'See exactly how the garment will look on you' },
  { num: '③', label: 'Place Order', desc: 'Order with confidence knowing exactly what you will receive' },
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80';

export function TryOnShowcase() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [showcaseImages, setShowcaseImages] = useState<string[]>([]);

  useEffect(() => {
    homepageApi.getTryOnConfig()
      .then((data: any) => {
        setIsEnabled(data?.isEnabled ?? false);
        setProviderName(data?.providerName ?? null);
        if (data?.showcaseImages?.length) {
          setShowcaseImages(data.showcaseImages);
        }
      })
      .catch(() => {});
  }, []);

  const displayImage = showcaseImages[0] || DEFAULT_IMAGE;
  return (
    <section className="py-24 px-4" style={{ backgroundColor: '#1A1412' }} aria-labelledby="try-on-heading">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-2 rounded-full bg-[#C97B3A]/10">
                ✦ {isEnabled ? 'Live Feature' : 'Coming Soon'}
              </span>
              {providerName && (
                <span className="inline-flex items-center gap-1 border border-white/20 text-white/60 text-xs font-medium px-3 py-1.5 rounded-full">
                  Powered by {providerName}
                </span>
              )}
            </div>
            <h2 id="try-on-heading" className="font-heading text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              See How It Looks <span style={{ color: '#C97B3A' }}>Before You Buy</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-10 font-light">
              Our AI-powered virtual try-on lets you visualise any garment on your own body silhouette — adjusted to your exact measurements — before you place your order.
            </p>

            {/* Feature bullets */}
            <div className="space-y-6 mb-10">
              {FEATURES.map((feat) => (
                <div key={feat.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 rounded-full border border-[#C97B3A]/40 bg-[#C97B3A]/10 flex items-center justify-center text-[#C97B3A] font-bold text-lg">
                    {feat.num}
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm mb-1">{feat.label}</div>
                    <div className="text-white/50 text-sm font-light">{feat.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white transition-colors"
                style={{ backgroundColor: '#C97B3A' }}
              >
                {isEnabled ? 'Try It Now →' : 'Explore Designs →'}
              </Link>
              <Link
                href="/orders/custom-design"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border border-white/30 text-white hover:bg-white/10 font-semibold text-sm transition-colors"
              >
                Explore Custom Designs →
              </Link>
            </div>
          </div>

          {/* Right column - image with sharp corners */}
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-800">
              <Image
                src={displayImage}
                alt="Virtual try-on showcase"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Size Match badge */}
              <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-2 shadow-lg">
                <div className="text-xs font-bold text-neutral-900">Size Match</div>
                <div className="text-xl font-bold" style={{ color: '#C97B3A' }}>89%</div>
              </div>
              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-6 py-4">
                <div className="text-white text-xs font-semibold mb-2">
                  Virtual Try-On{providerName ? ` / ${providerName}` : ' / AI-Powered Preview'}
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full" style={{ width: '89%', backgroundColor: '#C97B3A' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
