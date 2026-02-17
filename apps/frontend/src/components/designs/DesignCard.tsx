'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import { Design } from '@/types';
import { Badge } from '@/components/ui';
import { CURRENCY_SYMBOL } from '@/utils/constants';

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  return (
    <Link href={`/designs/${design.id}`}>
      <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-cream-dark">
        {/* Image Container with Overlay */}
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          <Image
            src={design.images[0]}
            alt={design.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white text-sm line-clamp-2">{design.description}</p>
            </div>
          </div>
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/90 text-dark text-xs backdrop-blur-sm">
              {design.category}
            </Badge>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          {/* Design Name */}
          <h3 className="font-semibold text-dark text-lg mb-1 line-clamp-1 group-hover:text-gold transition-colors">
            {design.name}
          </h3>

          {/* Designer Name */}
          <p className="text-sm text-gray-600 mb-2">
            by {design.designer.firstName} {design.designer.lastName}
          </p>

          {/* Country & Rating */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>{design.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-gold text-gold" />
              <span className="text-sm font-medium text-dark">{design.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">({design.reviewCount})</span>
            </div>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-cream-dark">
            <p className="text-2xl font-bold text-dark">
              {CURRENCY_SYMBOL}
              {design.price.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
