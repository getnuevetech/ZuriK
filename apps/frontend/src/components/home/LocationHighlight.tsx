import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { getCountryFlag } from '@/utils/helpers';
import { mockDesigns } from '@/data/mockDesigns';
import { mockDesigners } from '@/data/mockDesigners';

interface CountryData {
  name: string;
  designCount: number;
  designerCount: number;
}

const LocationHighlight: React.FC = () => {
  const topCountries = ['Nigeria', 'Kenya', 'Ghana', 'South Africa', 'Morocco', 'Ethiopia'];

  const getCountryStats = (countryName: string): CountryData => {
    const designCount = mockDesigns.filter(d => d.country === countryName).length;
    const designerCount = mockDesigners.filter(d => d.country === countryName).length;
    
    return {
      name: countryName,
      designCount: designCount || Math.floor(Math.random() * 20) + 5,
      designerCount: designerCount || Math.floor(Math.random() * 10) + 2,
    };
  };

  const countryStats = topCountries.map(getCountryStats);

  return (
    <section className="py-16 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-dark mb-4">
            Browse by Location
          </h2>
          <p className="text-lg text-dark-lighter max-w-2xl mx-auto">
            Explore fashion from across the African continent
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {countryStats.map((country) => (
            <Link key={country.name} href={`/designs?country=${encodeURIComponent(country.name)}`}>
              <Card 
                hover 
                padding="lg" 
                className="text-center cursor-pointer group transition-all hover:scale-105"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {getCountryFlag(country.name)}
                </div>
                
                <h3 className="font-display text-2xl font-semibold text-dark mb-4">
                  {country.name}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-dark-lighter">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-medium">{country.designCount}</span>
                    <span>Designs</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-dark-lighter">
                    <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{country.designerCount}</span>
                    <span>Designers</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocationHighlight;
