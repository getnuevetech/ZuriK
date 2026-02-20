import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-950 via-primary-900 to-accent-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block bg-secondary-500/20 text-secondary-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-secondary-500/30">
            Premium African Fashion Marketplace
          </span>
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Wear the Story of{' '}
            <span className="text-secondary-400">Africa</span>
          </h1>
          <p className="text-xl text-neutral-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover authentic designs, premium fabrics, and renowned artisans from across the African continent. Every piece tells a story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary" className="min-w-40">Shop Now</Button>
            </Link>
            <Link href="/register?role=designer">
              <Button size="lg" variant="outline" className="min-w-40 border-white text-white hover:bg-white hover:text-primary-900">
                Become a Designer
              </Button>
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto text-center">
            {[['500+', 'Designers'], ['10k+', 'Products'], ['50+', 'Fabrics']].map(([num, label]) => (
              <div key={label}>
                <div className="text-2xl font-heading font-bold text-secondary-400">{num}</div>
                <div className="text-sm text-neutral-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-4">Explore Our Collections</h2>
            <p className="text-neutral-500 text-lg max-w-xl mx-auto">From ready-to-wear to custom-made, discover fashion that celebrates African heritage</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Ready-to-Wear', desc: 'Modern African fashion for everyday elegance', icon: '👗', href: '/products', bg: 'from-primary-50 to-primary-100 border-primary-200', accent: 'text-primary-700' },
              { title: 'Premium Fabrics', desc: 'Ankara, Kente, Adire and more authentic textiles', icon: '🧵', href: '/fabrics', bg: 'from-secondary-50 to-secondary-100 border-secondary-200', accent: 'text-secondary-700' },
              { title: 'Custom Design', desc: 'Work with African designers for bespoke pieces', icon: '✂️', href: '/designers', bg: 'from-accent-50 to-accent-100 border-accent-200', accent: 'text-accent-700' },
            ].map((cat) => (
              <Link key={cat.title} href={cat.href} className={`group p-8 rounded-2xl border bg-gradient-to-br ${cat.bg} hover:shadow-card-hover transition-all duration-200`}>
                <div className="text-4xl mb-4">{cat.icon}</div>
                <h3 className={`font-heading text-xl font-bold mb-2 ${cat.accent}`}>{cat.title}</h3>
                <p className="text-neutral-600 text-sm">{cat.desc}</p>
                <div className={`mt-4 text-sm font-medium ${cat.accent} flex items-center gap-1 group-hover:gap-2 transition-all`}>
                  Explore <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-4">How It Works</h2>
            <p className="text-neutral-500 text-lg">Your journey from discovery to delivery</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Browse', desc: 'Discover thousands of African fashion pieces and fabrics', icon: '🔍' },
              { step: '02', title: 'Order', desc: 'Place your order with secure checkout', icon: '🛒' },
              { step: '03', title: 'Quality Check', desc: 'Our QA team inspects every item', icon: '✅' },
              { step: '04', title: 'Delivered', desc: 'Receive your authentic African fashion', icon: '📦' },
            ].map((step) => (
              <div key={step.step} className="text-center p-6 bg-white rounded-2xl border border-neutral-100 shadow-card">
                <div className="text-3xl mb-3">{step.icon}</div>
                <div className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">{step.step}</div>
                <h3 className="font-heading font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Designer Spotlight */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Designer Spotlight</h2>
              <p className="text-neutral-500">Talented designers bringing Africa&apos;s creativity to the world</p>
            </div>
            <Link href="/designers">
              <Button variant="outline" size="md">View All Designers</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Lagos', 'Accra', 'Nairobi', 'Dakar'].map((city, i) => (
              <div key={city} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-100 text-center hover:shadow-card transition-shadow">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 mx-auto mb-3 flex items-center justify-center text-white font-heading font-bold text-lg">
                  {['AO', 'KM', 'NJ', 'FS'][i]}
                </div>
                <div className="text-sm font-semibold text-neutral-800">Designer {i + 1}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{city}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-secondary-500 to-accent-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold text-white mb-4">Ready to Showcase Your Talent?</h2>
          <p className="text-white/80 text-lg mb-8">Join hundreds of African designers and fabric sellers on our platform. Reach customers worldwide.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=designer">
              <Button size="lg" variant="ghost" className="bg-white text-accent-700 hover:bg-neutral-50 min-w-44">
                Join as Designer
              </Button>
            </Link>
            <Link href="/register?role=fabric_seller">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 min-w-44">
                Sell Your Fabrics
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
