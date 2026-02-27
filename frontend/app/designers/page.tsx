'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { designsApi } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { SearchBar } from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/EmptyState';
import { getUserDisplayName } from '../../lib/utils';
import type { Design, Designer } from '../../types';

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
    designsApi.list()
      .then((res: { items: Design[] }) => {
        // Extract unique designers from designs
        const designs = res.items;
        const designerMap = new Map<string, DesignerWithProducts>();
        designs.forEach((p) => {
          if (p.designer) {
            const d = p.designer;
            const country = d.country || '';
            if (designerMap.has(d.id)) {
              const existing = designerMap.get(d.id)!;
              existing.productCount += 1;
              if (country && !existing.countries.includes(country)) {
                existing.countries.push(country);
              }
            } else {
              designerMap.set(d.id, {
                ...d,
                productCount: 1,
                countries: country ? [country] : [],
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
    <div className="catalog-shell">
      <div className="catalog-hero mb-8">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-primary)]/70 font-semibold mb-2">
          Atelier Network
        </p>
        <h1 className="catalog-hero-title font-heading font-semibold mb-2">Our Designers</h1>
        <p className="catalog-hero-copy">Talented artisans from across the African continent.</p>
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
                  <h3 className="font-heading font-semibold text-[var(--color-primary-dark)] text-xl mb-1">{name}</h3>
                  {designer.countries.length > 0 && (
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">📍 {designer.countries.join(', ')}</p>
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
