'use client';

import React from 'react';
import Link from 'next/link';

export function CulturalHeritage() {
  return (
    <section className="py-20 px-4 bg-accent-50" aria-labelledby="heritage-heading">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text side */}
          <div>
            <span className="inline-block text-accent-600 text-sm font-semibold uppercase tracking-widest mb-4">
              Our Heritage
            </span>
            <h2 id="heritage-heading" className="font-heading text-4xl sm:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              The Story Behind the Stitch
            </h2>
            <p className="text-neutral-600 text-lg leading-relaxed mb-6">
              Each fabric tells a story. Each pattern carries meaning. From the royal{' '}
              <span className="text-secondary-600 font-semibold">Kente of Ghana</span> to the
              indigo <span className="text-secondary-600 font-semibold">Adire of Nigeria</span> —
              discover the heritage woven into every thread.
            </p>
            <p className="text-neutral-600 leading-relaxed mb-8">
              African fashion is not just clothing — it is identity, history, and pride. Every stitch
              connects generations, every colour carries tradition. We are proud to bring these
              stories to the world.
            </p>
            <Link
              href="/fabrics"
              className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Explore Our Heritage <span>→</span>
            </Link>
          </div>

          {/* Visual side — African pattern collage placeholder */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Kente — Ghana', gradient: 'from-yellow-400 to-yellow-600', pattern: '▦' },
              { label: 'Ankara — Nigeria', gradient: 'from-green-500 to-green-700', pattern: '◈' },
              { label: 'Kitenge — Tanzania', gradient: 'from-blue-500 to-teal-600', pattern: '◉' },
              { label: 'Shweshwe — South Africa', gradient: 'from-indigo-500 to-indigo-700', pattern: '◇' },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl bg-gradient-to-br ${item.gradient} h-40 flex flex-col items-center justify-center gap-2 shadow-md`}
              >
                <span className="text-white text-4xl opacity-60">{item.pattern}</span>
                <span className="text-white text-xs font-medium text-center px-2">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
