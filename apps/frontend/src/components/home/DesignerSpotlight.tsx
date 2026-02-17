import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { mockDesigners } from '@/data/mockDesigners';
import { mockDesigns } from '@/data/mockDesigns';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { truncate, getCountryFlag } from '@/utils/helpers';

const DesignerSpotlight: React.FC = () => {
  const featuredDesigners = mockDesigners.slice(0, 3);

  const getDesignerDesigns = (designerId: string) => {
    return mockDesigns
      .filter(design => design.designerId === designerId)
      .slice(0, 3);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-dark mb-4">
            Designer Spotlight
          </h2>
          <p className="text-lg text-dark-lighter max-w-2xl mx-auto">
            Meet the creative minds behind Africa&apos;s most stunning fashion designs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDesigners.map((designer) => {
            const designs = getDesignerDesigns(designer.id);
            
            return (
              <Card key={designer.id} padding="lg" className="flex flex-col">
                <div className="text-center mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src={designer.avatar || '/default-avatar.png'}
                      alt={`${designer.firstName} ${designer.lastName}`}
                      fill
                      className="object-cover rounded-full border-4 border-gold"
                      sizes="128px"
                    />
                  </div>
                  
                  <h3 className="font-display text-2xl font-semibold text-dark mb-2">
                    {designer.firstName} {designer.lastName}
                  </h3>
                  
                  <Badge variant="accent" size="md" className="mb-3">
                    {getCountryFlag(designer.country)} {designer.country}
                  </Badge>
                  
                  <p className="text-sm text-dark-lighter leading-relaxed mb-4">
                    {truncate(designer.bio || '', 120)}
                  </p>
                </div>

                {designs.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-dark mb-3">Recent Designs</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {designs.map((design) => (
                        <Link 
                          key={design.id} 
                          href={`/designs/${design.id}`}
                          className="relative aspect-square rounded overflow-hidden hover:ring-2 hover:ring-gold transition-all"
                        >
                          <Image
                            src={design.images[0]}
                            alt={design.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 10vw"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto space-y-3">
                  {designer.instagramHandle && (
                    <a
                      href={`https://instagram.com/${designer.instagramHandle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-accent hover:text-accent-dark transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-sm">{designer.instagramHandle}</span>
                    </a>
                  )}
                  
                  <Link href={`/designers/${designer.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DesignerSpotlight;
