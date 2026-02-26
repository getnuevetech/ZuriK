'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PriceDisplay } from '../common/PriceDisplay';
import { getUserDisplayName } from '../../lib/utils';
import type { Fabric } from '../../types';

interface FabricCardProps {
  fabric: Fabric;
  onOrder?: (fabric: Fabric) => void;
}

export function FabricCard({ fabric, onOrder }: FabricCardProps) {
  const sellerName = fabric.seller ? getUserDisplayName(fabric.seller) : null;

  const inStock = fabric.stock > 0;

  return (
    <Card hover className="flex flex-col h-full">
      <div className="relative w-full h-60 bg-gradient-to-br from-[#efe4d6] to-[#f9f3eb] flex items-center justify-center overflow-hidden">
        {fabric.images && fabric.images.length > 0 ? (
          <Image
            src={fabric.images[0]}
            alt={fabric.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <span className="text-4xl">🧵</span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full uppercase tracking-[0.12em]">Out of Stock</span>
          </div>
        )}
      </div>
      <CardBody className="flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {fabric.material && <Badge variant="primary">{fabric.material}</Badge>}
          {fabric.patterns?.[0] && <Badge variant="secondary">{fabric.patterns[0]}</Badge>}
          {fabric.seller?.country && <Badge variant="default">{fabric.seller.country}</Badge>}
        </div>
        <h3 className="font-heading font-semibold text-[var(--color-primary-dark)] text-lg mb-1 line-clamp-1">{fabric.name}</h3>
        {sellerName && (
          <p className="text-xs text-[var(--color-text-muted)] mb-1">Seller: {sellerName}</p>
        )}
        {fabric.description && (
          <p className="text-sm text-[var(--color-text-muted)] mb-2 line-clamp-2 flex-1">{fabric.description}</p>
        )}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <PriceDisplay amount={fabric.customerPrice} className="text-2xl font-heading font-semibold text-[var(--color-primary)]" />
            <span className={`text-xs font-semibold uppercase tracking-[0.12em] ${inStock ? 'text-[#2f7d55]' : 'text-red-500'}`}>
              {inStock ? `${fabric.stock} in stock` : 'Out of Stock'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/fabrics/${fabric.id}`}>
              <Button variant="outline" size="sm" className="w-full">View Details</Button>
            </Link>
            {onOrder && (
              <Button variant="primary" size="sm" onClick={() => onOrder(fabric)} disabled={!inStock}>
                Order Fabric
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
