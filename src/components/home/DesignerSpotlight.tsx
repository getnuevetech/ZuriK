'use client';

import React from 'react';
import Link from 'next/link';
import { FiInstagram, FiFacebook, FiGlobe } from 'react-icons/fi';
import { mockDesigners } from '@/data/mockDesigners';
import Card from '@/components/ui/Card';

export default function DesignerSpotlight() {
  const spotlightDesigners = mockDesigners.slice(0, 3);

  return (
    <section className="py-16 bg-african-cream">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-african-dark mb-4">
            Designer Spotlight
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet the talented creators behind the designs. Each designer brings 
            their unique vision and cultural heritage to every piece.
          </p>
        </div>

        {/* Designers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {spotlightDesigners.map((designer) => (
            <Card key={designer.id} hoverable>
              <Link href={`/designers/${designer.id}`}>
                {/* Cover Image */}
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={designer.coverImage || 'https://images.unsplash.com/photo-1558769132-cb1aea3c9763?w=800'}
                    alt={designer.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Profile Image */}
                <div className="relative px-6 pb-6">
                  <div className="-mt-12 mb-4">
                    <img
                      src={designer.profileImage || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200'}
                      alt={designer.name}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                  </div>

                  {/* Designer Info */}
                  <h3 className="text-xl font-serif font-bold text-african-dark mb-2">
                    {designer.name}
                  </h3>
                  <p className="text-sm text-gold mb-3">
                    {designer.country}
                  </p>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {designer.bio}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div>
                      <span className="font-semibold text-african-dark">
                        {designer.designCount}
                      </span>{' '}
                      Designs
                    </div>
                    <div>
                      <span className="font-semibold text-african-dark">
                        {designer.rating}
                      </span>{' '}
                      ⭐
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {designer.socialLinks?.instagram && (
                      <a
                        href={`https://instagram.com/${designer.socialLinks.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiInstagram size={18} />
                      </a>
                    )}
                    {designer.socialLinks?.facebook && (
                      <a
                        href={`https://facebook.com/${designer.socialLinks.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiFacebook size={18} />
                      </a>
                    )}
                    {designer.socialLinks?.website && (
                      <a
                        href={designer.socialLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gold transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FiGlobe size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
