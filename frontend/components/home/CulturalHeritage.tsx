'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const FALLBACK_SWATCHES = [
  { label: 'Kente — Ghana', bg: 'bg-secondary-500' },
  { label: 'Ankara — Nigeria', bg: 'bg-neutral-700' },
  { label: 'Kitenge — Tanzania', bg: 'bg-neutral-500' },
  { label: 'Shweshwe — South Africa', bg: 'bg-secondary-700' },
];

export function CulturalHeritage() {
  const [stories, setStories] = useState<HeritageStory[]>([]);

  useEffect(() => {
    homepageApi.getHeritageStories()
      .then((data: HeritageStory[]) => setStories(data ?? []))
      .catch(() => setStories([]));
  }, []);

  const featured = stories[0];
  const rest = stories.slice(1, 5);

  return (
    <section className="py-24 px-4 bg-neutral-50" aria-labelledby="heritage-heading">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <div>
            <span className="inline-block text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-6">
              Our Heritage
            </span>
            {featured ? (
              <>
                <h2 id="heritage-heading" className="font-heading text-4xl sm:text-5xl font-bold text-neutral-900 mb-8 leading-tight tracking-tight">
                  {featured.title}
                </h2>
                <p className="text-neutral-500 text-base leading-relaxed mb-10 font-light">
                  {featured.excerpt}
                </p>
              </>
            ) : (
              <>
                <h2 id="heritage-heading" className="font-heading text-4xl sm:text-5xl font-bold text-neutral-900 mb-8 leading-tight tracking-tight">
                  The Story Behind the Stitch
                </h2>
                <p className="text-neutral-500 text-base leading-relaxed mb-5 font-light">
                  Each fabric tells a story. Each pattern carries meaning. From the royal{' '}
                  <span className="text-neutral-800 font-medium">Kente of Ghana</span> to the
                  indigo <span className="text-neutral-800 font-medium">Adire of Nigeria</span> —
                  discover the heritage woven into every thread.
                </p>
                <p className="text-neutral-500 text-base leading-relaxed mb-10 font-light">
                  African fashion is not just clothing — it is identity, history, and pride. Every stitch
                  connects generations, every colour carries tradition.
                </p>
              </>
            )}
            <Link
              href="/fabrics"
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-700 text-white font-semibold text-sm uppercase tracking-widest px-8 py-3.5 transition-colors"
            >
              Explore Our Heritage <span>→</span>
            </Link>
          </div>

          {/* Visual side */}
          {rest.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {rest.map((story) =>
                story.coverImage ? (
                  <div key={story.id} className="relative aspect-square overflow-hidden">
                    <Image
                      src={story.coverImage}
                      alt={story.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-end justify-end p-4">
                      <span className="text-white/80 text-xs font-light text-right leading-tight">{story.title}</span>
                    </div>
                  </div>
                ) : (
                  <div key={story.id} className="bg-neutral-700 aspect-square flex flex-col items-end justify-end p-4">
                    <span className="text-white/80 text-xs font-light text-right leading-tight">{story.title}</span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {FALLBACK_SWATCHES.map((item) => (
                <div
                  key={item.label}
                  className={`${item.bg} aspect-square flex flex-col items-end justify-end p-4`}
                >
                  <span className="text-white/80 text-xs font-light text-right leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
