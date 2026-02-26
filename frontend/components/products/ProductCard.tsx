'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PriceDisplay } from '../common/PriceDisplay';
import { StarRating } from '../reviews/StarRating';
import { WishlistButton } from '../WishlistButton';
import { CompareButton } from './CompareButton';
import { getUserDisplayName } from '../../lib/utils';
import { ShareButton } from '../common/ShareButton';
import { getShareUrl } from '../../lib/share-utils';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const designerName = product.designer ? getUserDisplayName(product.designer) : null;

  return (
    <Card hover className="flex flex-col h-full">
      <div className="relative w-full h-60 bg-gradient-to-br from-[#ece3d6] to-[#f8f3ea] flex items-center justify-center overflow-hidden">
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
        <WishlistButton
          productId={product.id}
          size="sm"
          className="absolute top-2 right-2 bg-white/90 hover:bg-white p-1.5 shadow-sm border border-[#e5d8c9]"
        />
        <div className="absolute top-2 left-2 z-10">
          <ShareButton
            url={getShareUrl(`/products/${product.id}`)}
            title={product.name}
            description={product.description}
            image={product.images?.[0]}
            type="product"
            variant="icon"
            size="sm"
          />
        </div>
      </div>
      <CardBody className="flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {product.category && <Badge variant="primary">{product.category}</Badge>}
          {product.designer?.country && <Badge variant="secondary">{product.designer.country}</Badge>}
        </div>
        <h3 className="font-heading font-semibold text-[var(--color-primary-dark)] text-lg mb-1 line-clamp-1">{product.name}</h3>
        {/* Rating */}
        {(product.totalReviews ?? 0) > 0 ? (
          <div className="flex items-center gap-1.5 mb-1">
            <StarRating rating={product.averageRating ?? 0} size="sm" />
            <span className="text-xs text-[var(--color-text-muted)]">({product.totalReviews})</span>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-muted)]/80 mb-1">No reviews yet</p>
        )}
        {designerName && (
          <Link
            href={`/designers/${product.designer!.id}`}
            className="text-xs text-[var(--color-primary)] hover:underline mb-2"
            onClick={(e) => e.stopPropagation()}
          >
            by {designerName}
          </Link>
        )}
        {product.description && (
          <p className="text-sm text-[var(--color-text-muted)] mb-3 line-clamp-2 flex-1">{product.description}</p>
        )}
        <div className="mt-auto">
          <PriceDisplay amount={product.customerPrice} className="text-2xl font-heading font-semibold text-[var(--color-primary)] block mb-3" />
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
          <div className="mt-2">
            <CompareButton product={product} size="sm" className="w-full justify-center" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
