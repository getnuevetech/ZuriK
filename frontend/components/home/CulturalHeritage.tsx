'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { homepageApi } from '../../lib/api';

interface HeritageStory {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  country: string | null;
  fabricType: string | null;
  tags: string[] | null;
  displayOrder: number;
  isActive: boolean;
}

const HERITAGE_CARDS = [
  { label: 'Kente', country: 'Ghana', bg: 'from-yellow-700 to-yellow-900', icon: '🟡' },
  { label: 'Ankara', country: 'Nigeria', bg: 'from-orange-700 to-red-900', icon: '🟠' },
  { label: 'Kitenge', country: 'Tanzania', bg: 'from-blue-700 to-blue-900', icon: '🔵' },
  { label: 'Shweshwe', country: 'South Africa', bg: 'from-indigo-700 to-purple-900', icon: '🟣' },
];

export function CulturalHeritage() {
  const [stories, setStories] = useState<HeritageStory[]>([]);

  useEffect(() => {
    homepageApi.getHeritageStories()
      .then((data: HeritageStory[]) => setStories(data ?? []))
      .catch(() => setStories([]));
  }, []);

  const featured = stories[0];

  return (
    <section className="py-24 px-4" style={{ backgroundColor: '#1A1412' }} aria-labelledby="heritage-heading">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column */}
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 border border-[#C97B3A]/40 text-[#C97B3A] text-xs font-medium px-4 py-2 rounded-full bg-[#C97B3A]/10">
                ✦ Our Heritage
              </span>
            </div>
            <h2 id="heritage-heading" className="font-heading text-4xl sm:text-5xl font-bold text-white mb-8 leading-tight">
              {featured ? featured.title : (
                <>The Story Behind <span style={{ color: '#C97B3A' }}>the Stitch</span></>
              )}
            </h2>
            {featured ? (
              <p className="text-white/60 text-base leading-relaxed mb-10 font-light">{featured.excerpt}</p>
            ) : (
              <>
                <p className="text-white/60 text-base leading-relaxed mb-5 font-light">
                  Each fabric tells a story. Each pattern carries meaning. From the royal{' '}
                  <span className="text-white font-medium">Kente of Ghana</span> to the indigo{' '}
                  <span className="text-white font-medium">Adire of Nigeria</span> — discover the heritage woven into every thread.
                </p>
                <p className="text-white/60 text-base leading-relaxed mb-10 font-light">
                  African fashion is not just clothing — it is identity, history, and pride. Every stitch connects generations, every colour carries tradition.
                </p>
              </>
            )}
            <Link
              href="/fabrics"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white transition-colors"
              style={{ backgroundColor: '#C97B3A' }}
            >
              Explore Our Heritage →
            </Link>
          </div>

          {/* Right column - 2x2 grid */}
          <div className="grid grid-cols-2 gap-4">
            {HERITAGE_CARDS.map((card) => (
              <div
                key={card.label}
                className={`relative aspect-square bg-gradient-to-br ${card.bg} flex flex-col justify-end p-5`}
              >
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-white font-bold text-lg">{card.label}</div>
                <div className="text-white/60 text-xs font-light">{card.country}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
