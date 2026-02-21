'use client';

import React, { useEffect, useState } from 'react';
import { abandonedCartsAdminApi, type AbandonedCartStats } from '../../lib/api';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Spinner } from '../ui/Spinner';

export function AbandonedCartStats() {
  const [stats, setStats] = useState<AbandonedCartStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    abandonedCartsAdminApi
      .getStats()
      .then(setStats)
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (error || !stats) {
    return <p className="text-red-500 text-sm">{error ?? 'No data available'}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-neutral-500">Total Abandoned</p>
        </CardHeader>
        <CardBody>
          <p className="text-3xl font-bold text-indigo-700">{stats.totalAbandoned.toLocaleString()}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-neutral-500">Recovery Rate</p>
        </CardHeader>
        <CardBody className="flex items-center gap-2">
          <p className="text-3xl font-bold text-emerald-600">{stats.recoveryRate}%</p>
          <Badge variant={stats.recoveryRate >= 20 ? 'success' : 'warning'}>
            {stats.recovered} recovered
          </Badge>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-sm font-medium text-neutral-500">Recovered Revenue</p>
        </CardHeader>
        <CardBody>
          <p className="text-3xl font-bold text-amber-600">
            ${stats.totalRecoveredRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
