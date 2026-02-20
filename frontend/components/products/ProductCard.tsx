'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PriceDisplay } from '../common/PriceDisplay';
import { StarRating } from '../reviews/StarRating';
import { getUserDisplayName } from '../../lib/utils';
import { WishlistButton } from '../WishlistButton';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const designerName = product.designer ? getUserDisplayName(product.designer) : null;

  return (
    <Card hover className="flex flex-col h-full">
      <div className="relative w-full h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <span className="text-4xl">👗</span>
        )}
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
      </div>
      <CardBody className="flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {product.category && <Badge variant="primary">{product.category}</Badge>}
          {product.country && <Badge variant="secondary">{product.country}</Badge>}
        </div>
        <h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{product.name}</h3>
        {/* Rating */}
        {(product.totalReviews ?? 0) > 0 ? (
          <div className="flex items-center gap-1.5 mb-1">
            <StarRating rating={product.averageRating ?? 0} size="sm" />
            <span className="text-xs text-neutral-500">({product.totalReviews})</span>
          </div>
        ) : (
          <p className="text-xs text-neutral-400 mb-1">No reviews yet</p>
        )}
        {designerName && (
          <Link
            href={`/designers/${product.designer!.id}`}
            className="text-xs text-primary-600 hover:underline mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            by {designerName}
          </Link>
        )}
        {product.description && (
          <p className="text-sm text-neutral-500 mb-3 line-clamp-2 flex-1">{product.description}</p>
        )}
        <div className="mt-auto">
          <PriceDisplay amount={product.customerPrice} className="text-xl font-bold text-secondary-600 block mb-3" />
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/products/${product.id}`}>
              <Button variant="outline" size="sm" className="w-full">View Details</Button>
            </Link>
            {onAddToCart && (
              <Button variant="primary" size="sm" onClick={() => onAddToCart(product)}>
                Add to Cart
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
