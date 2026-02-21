'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { productsApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { getUserDisplayName } from '../../lib/utils';
import type { Product, Designer } from '../../types';

interface DesignerWithProducts extends Designer {
  productCount: number;
  countries: string[];
}

export default function DesignersPage() {
  const { toast } = useToast();
  const [designers, setDesigners] = useState<DesignerWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    productsApi.list()
      .then((res: { items: Product[] }) => {
        // Extract unique designers from products
        const products = res.items;
        const designerMap = new Map<string, DesignerWithProducts>();
        products.forEach((p) => {
          if (p.designer) {
            const d = p.designer;
            if (designerMap.has(d.id)) {
              const existing = designerMap.get(d.id)!;
              existing.productCount += 1;
              if (p.country && !existing.countries.includes(p.country)) {
                existing.countries.push(p.country);
              }
            } else {
              designerMap.set(d.id, {
                ...d,
                productCount: 1,
                countries: p.country ? [p.country] : [],
              });
            }
          }
        });
        setDesigners(Array.from(designerMap.values()));
      })
      .catch(() => toast('error', 'Failed to load designers'))
      .finally(() => setLoading(false));
  }, [toast]);

  const filtered = useMemo(() => {
    if (!search) return designers;
    const q = search.toLowerCase();
    return designers.filter((d) => {
      const name = `${d.firstName ?? ''} ${d.lastName ?? ''}`.toLowerCase();
      return name.includes(q) || d.email.toLowerCase().includes(q);
    });
  }, [designers, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Our Designers</h1>
        <p className="text-neutral-500">Talented artisans from across the African continent</p>
      </div>

      <div className="mb-6 max-w-md">
        <SearchBar onSearch={setSearch} placeholder="Search designers..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No designers found"
          message={designers.length === 0 ? 'Be the first to join as a designer!' : 'Try a different search term'}
          icon="✂️"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((designer) => {
            const name = getUserDisplayName(designer);
            return (
              <Card key={designer.id} hover>
                <CardBody className="flex flex-col items-center text-center py-8">
                  <Avatar name={name} size="xl" className="mb-4" />
                  <h3 className="font-semibold text-neutral-900 text-lg mb-1">{name}</h3>
                  {designer.countries.length > 0 && (
                    <p className="text-sm text-neutral-500 mb-2">📍 {designer.countries.join(', ')}</p>
                  )}
                  <div className="flex items-center gap-2 mb-4 flex-wrap justify-center">
                    <Badge variant="primary">Designer</Badge>
                    <Badge variant="default">{designer.productCount} design{designer.productCount !== 1 ? 's' : ''}</Badge>
                  </div>
                  <Link href={`/designers/${designer.id}`}>
                    <Button variant="outline" size="sm">View Portfolio</Button>
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
