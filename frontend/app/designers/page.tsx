'use client';

import React, { useEffect, useState } from 'react';
import { designersApi } from '../../lib/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';

interface Designer {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  bio?: string;
  location?: string;
}

export default function DesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    designersApi.list()
      .then((data) => setDesigners(Array.isArray(data) ? data : []))
      .catch((err) => { console.error('Error:', err); setError('Unable to load designers.'); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold text-neutral-900 mb-2">Our Designers</h1>
        <p className="text-neutral-500">Talented artisans from across the African continent</p>
      </div>
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : error ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">😞</div>
          <p className="text-neutral-500">{error}</p>
        </div>
      ) : designers.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">✂️</div>
          <h3 className="font-heading text-xl font-semibold text-neutral-700 mb-2">No designers yet</h3>
          <p className="text-neutral-500">Be the first to join as a designer!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designers.map((designer) => {
            const name = [designer.firstName, designer.lastName].filter(Boolean).join(' ') || designer.email;
            return (
              <Card key={designer.id} hover>
                <CardBody className="flex flex-col items-center text-center py-8">
                  <Avatar name={name} size="xl" className="mb-4" />
                  <h3 className="font-semibold text-neutral-900 text-lg mb-1">{name}</h3>
                  {designer.location && <p className="text-sm text-neutral-500 mb-2">📍 {designer.location}</p>}
                  {designer.bio && <p className="text-sm text-neutral-500 mb-3 line-clamp-3">{designer.bio}</p>}
                  <Badge variant="primary">Designer</Badge>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
