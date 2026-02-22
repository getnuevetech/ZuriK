'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { homepageApi } from '../../lib/api';

interface CollectionPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  tags: string[] | null;
  slug: string | null;
}

const FALLBACK_POSTS: CollectionPost[] = [
  {
    id: 'fallback-1',
    title: 'The Art of Kente Weaving',
    excerpt: 'Discover the centuries-old tradition of Kente cloth from Ghana and its royal significance.',
    coverImage: null,
    tags: ['Ghana', 'Kente'],
    slug: null,
  },
  {
    id: 'fallback-2',
    title: 'Modern Ankara: Tradition Meets Contemporary',
    excerpt: 'How Nigerian designers are reimagining Ankara fabric for the global stage.',
    coverImage: null,
    tags: ['Nigeria', 'Ankara'],
    slug: null,
  },
  {
    id: 'fallback-3',
    title: 'Kitenge Stories from East Africa',
    excerpt: 'The vibrant patterns of Kitenge tell stories of culture, celebration, and community.',
    coverImage: null,
    tags: ['Tanzania', 'Kitenge'],
    slug: null,
  },
];

const FALLBACK_BG_COLORS = ['bg-neutral-800', 'bg-secondary-600', 'bg-neutral-700'];

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-neutral-200 h-56 w-full mb-4" />
      <div className="space-y-2">
        <div className="bg-neutral-200 h-3 w-1/4 rounded" />
        <div className="bg-neutral-200 h-5 w-3/4 rounded" />
        <div className="bg-neutral-200 h-3 w-full rounded" />
        <div className="bg-neutral-200 h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

export function CollectionPosts() {
  const [posts, setPosts] = useState<CollectionPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    homepageApi
      .getCollectionPosts()
      .then((data: CollectionPost[]) => setPosts(data ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const displayPosts = posts.length > 0 ? posts.slice(0, 3) : FALLBACK_POSTS;

  return (
    <section className="py-24 px-4 bg-neutral-50" aria-labelledby="collection-posts-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-3">
              Stories &amp; Inspiration
            </p>
            <h2
              id="collection-posts-heading"
              className="font-heading text-4xl font-bold text-neutral-900 tracking-tight"
            >
              From Our Collection
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : displayPosts.map((post, idx) => {
                const href = post.slug ? `/collections/${post.slug}` : '/products';
                return (
                  <Link key={post.id} href={href} className="group block">
                    <div className="relative overflow-hidden h-56 mb-4">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 ${FALLBACK_BG_COLORS[idx % FALLBACK_BG_COLORS.length]}`}
                        />
                      )}
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
                        {post.tags[0]}
                      </p>
                    )}
                    <h3 className="font-heading text-xl font-bold text-neutral-900 mb-2 group-hover:text-neutral-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-neutral-500 text-sm font-light leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
