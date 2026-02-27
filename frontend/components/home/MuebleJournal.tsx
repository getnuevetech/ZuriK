import React from 'react';
import Link from 'next/link';

const posts = [
  { id: 1, title: 'Discover a world of authentic African fashion', category: 'Promos', emoji: '🌍' },
  { id: 2, title: 'It is time to renew your wardrobe with our new collection', category: 'News', emoji: '✨' },
  { id: 3, title: 'Fresh colors for our new season fabrics', category: 'Promos', emoji: '🎨' },
];

export function MuebleJournal() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-wider text-gray-500">Journal</span>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1a237e] mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Latest Posts
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.id} className="group">
              <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#1a237e]/10 to-[#1a237e]/20 flex items-center justify-center text-7xl">
                {post.emoji}
              </div>
              <div className="bg-white p-6 -mt-8 mx-4 relative shadow-lg">
                <span className="text-xs uppercase tracking-wider text-gray-500">{post.category}</span>
                <h3 className="text-lg font-bold text-[#1a237e] mt-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  —{post.title}
                </h3>
                <Link href="#" className="inline-block mt-4 text-sm text-gray-500 hover:text-[#00c853] transition-colors underline underline-offset-4">
                  read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
