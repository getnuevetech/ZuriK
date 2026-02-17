import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-african-cream via-gold-light to-african-cream min-h-[600px] flex items-center">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-african-pattern"></div>
      
      <div className="container-custom relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-african-dark mb-6">
              Authentic African
              <span className="block text-gold mt-2">Fashion & Design</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-xl">
              Discover unique handcrafted designs from talented African designers. 
              From traditional wear to contemporary fashion, celebrate heritage with every piece.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/designs">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Designs
                </Button>
              </Link>
              <Link href="/designers">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Meet Our Designers
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-300">
              <div>
                <div className="text-3xl font-bold text-gold">500+</div>
                <div className="text-sm text-gray-600 mt-1">Unique Designs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold">100+</div>
                <div className="text-sm text-gray-600 mt-1">Designers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold">20+</div>
                <div className="text-sm text-gray-600 mt-1">Countries</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop"
                    alt="African Fashion"
                    className="w-full h-64 object-cover rounded-lg shadow-xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=400&h=300&fit=crop"
                    alt="African Fashion"
                    className="w-full h-48 object-cover rounded-lg shadow-xl"
                  />
                </div>
                <div className="space-y-4 mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1602810319428-019690571b5b?w=400&h=300&fit=crop"
                    alt="African Fashion"
                    className="w-full h-48 object-cover rounded-lg shadow-xl"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&h=500&fit=crop"
                    alt="African Fashion"
                    className="w-full h-64 object-cover rounded-lg shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
