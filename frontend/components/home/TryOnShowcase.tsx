'use client';

import React from 'react';
import Link from 'next/link';

export function TryOnShowcase() {
  return (
    <section className="py-20 px-4 bg-primary-950" aria-labelledby="try-on-heading">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-4">
          <span className="inline-block bg-secondary-500/20 text-secondary-300 text-sm font-medium px-4 py-1.5 rounded-full border border-secondary-500/30">
            Innovation
          </span>
        </div>
        <h2 id="try-on-heading" className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
          See How It Looks Before You Buy
        </h2>
        <p className="text-neutral-300 text-lg max-w-2xl mx-auto mb-12">
          Our 3D Try-On technology lets you visualise your custom design before ordering. Coming soon.
        </p>

        {/* Visual mockup area */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { label: 'Choose Fabric', icon: '🧵', gradient: 'from-secondary-600 to-secondary-800' },
            { label: 'Visualise Design', icon: '👗', gradient: 'from-accent-600 to-accent-800' },
            { label: 'Place Order', icon: '✅', gradient: 'from-primary-600 to-primary-800' },
          ].map((step) => (
            <div
              key={step.label}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${step.gradient} h-52 flex flex-col items-center justify-center`}
            >
              {/* African pattern overlay */}
              <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,_transparent,_transparent_10px,_rgba(255,255,255,0.5)_10px,_rgba(255,255,255,0.5)_11px)]" />
              <div className="relative z-10 text-5xl mb-3">{step.icon}</div>
              <div className="relative z-10 text-white font-semibold">{step.label}</div>
            </div>
          ))}

          {/* Coming Soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-secondary-500/40">
              <span className="text-secondary-300 font-heading font-bold text-2xl">Coming Soon</span>
            </div>
          </div>
        </div>

        <Link
          href="/orders/custom-design"
          className="inline-flex items-center gap-2 bg-secondary-500 hover:bg-secondary-400 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Explore Custom Designs <span>→</span>
        </Link>
      </div>
    </section>
  );
}
