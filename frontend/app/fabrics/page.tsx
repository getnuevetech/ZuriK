'use client';

import React, { useEffect, useState } from 'react';
import { fabricsApi } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

interface Fabric {
  id: number;
  name: string;
  description?: string;
  price?: number;
  origin?: string;
}

export default function FabricsPage() {
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fabricsApi.list()
      .then((data) => setFabrics(data))
      .catch((err) => console.error('Error fetching fabrics:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Premium Fabrics</h1>
        <p className="text-neutral-500">Authentic African textiles — Ankara, Kente, Adire and more</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : fabrics.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🧵</div>
          <h3 className="font-heading text-xl font-semibold text-neutral-700 mb-2">No fabrics listed yet</h3>
          <p className="text-neutral-500">Fabric sellers are coming soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fabrics.map((fabric) => (
            <Card key={fabric.id} hover>
              <div className="w-full h-40 bg-gradient-to-br from-secondary-100 to-accent-100 flex items-center justify-center rounded-t-2xl">
                <span className="text-4xl">🧵</span>
              </div>
              <CardBody>
                {fabric.origin && <Badge variant="secondary" className="mb-2">{fabric.origin}</Badge>}
                <h3 className="font-semibold text-neutral-900 mb-1">{fabric.name}</h3>
                {fabric.description && <p className="text-sm text-neutral-500 mb-2 line-clamp-2">{fabric.description}</p>}
                {fabric.price !== undefined && <p className="text-lg font-bold text-secondary-600">${fabric.price}</p>}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
