'use client';

import Link from 'next/link';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { Design } from '@/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatPrice } from '@/utils/helpers';

interface DesignCardProps {
  design: Design;
}

export default function DesignCard({ design }: DesignCardProps) {
  return (
    <Card hoverable>
      <Link href={`/designs/${design.id}`}>
        {/* Image */}
        <div className="relative h-80 overflow-hidden group">
          <img
            src={design.images[0]}
            alt={design.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {design.featured && (
              <Badge variant="gold" className="backdrop-blur-sm bg-gold/90">
                Featured
              </Badge>
            )}
            {!design.inStock && (
              <Badge variant="error" className="backdrop-blur-sm bg-red-500/90 text-white">
                Sold Out
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-2 bg-white rounded-full shadow-md hover:bg-gold hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to wishlist logic
              }}
            >
              <FiHeart size={20} />
            </button>
            <button
              className="p-2 bg-white rounded-full shadow-md hover:bg-gold hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Add to cart logic
              }}
            >
              <FiShoppingCart size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-sm text-gold">{design.designer.name}</p>
            <p className="text-xs text-gray-500">{design.country}</p>
          </div>
          
          <h3 className="text-lg font-semibold text-african-dark mb-2 line-clamp-2">
            {design.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {design.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {design.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-african-dark">
              {formatPrice(design.price, design.currency as any)}
            </div>
            {design.rating && (
              <div className="flex items-center gap-1 text-sm">
                <span>⭐</span>
                <span className="font-semibold">{design.rating}</span>
                <span className="text-gray-500">({design.reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </Card>
  );
}
