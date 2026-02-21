'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { productsApi, fabricsApi } from '../../../lib/api';
import type { Product } from '../../../types/product';
import type { Fabric } from '../../../types/fabric';
import { useToast } from '../../../components/ui/Toast';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';

type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

function getStockStatus(stock: number, threshold: number): StockStatus {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= threshold) return 'low-stock';
  return 'in-stock';
}

const STOCK_BADGE: Record<StockStatus, 'success' | 'warning' | 'danger'> = {
  'in-stock': 'success',
  'low-stock': 'warning',
  'out-of-stock': 'danger',
};

const STOCK_LABEL: Record<StockStatus, string> = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock',
};

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
  itemType: 'product' | 'fabric';
}

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const isDesigner = user?.role === 'designer';
  const isFabricSeller = user?.role === 'fabric_seller';

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      if (isDesigner) {
        const [products, lowStock] = await Promise.all([
          productsApi.list({ limit: 100 }),
          productsApi.getLowStock().catch(() => [] as Product[]),
        ]);
        const mapped = products.items.map((p) => ({
          id: p.id,
          name: p.name,
          stock: (p as any).stock ?? 0,
          lowStockThreshold: (p as any).lowStockThreshold ?? 5,
          itemType: 'product' as const,
        }));
        setItems(mapped);
        setLowStockItems(lowStock.map((p) => ({
          id: p.id,
          name: p.name,
          stock: (p as any).stock ?? 0,
          lowStockThreshold: (p as any).lowStockThreshold ?? 5,
          itemType: 'product' as const,
        })));
      } else if (isFabricSeller) {
        const [fabrics, lowStock] = await Promise.all([
          fabricsApi.list({ limit: 100 }),
          fabricsApi.getLowStock().catch(() => [] as Fabric[]),
        ]);
        const mapped = fabrics.items.map((f) => ({
          id: f.id,
          name: f.name,
          stock: (f as any).stock ?? 0,
          lowStockThreshold: (f as any).lowStockThreshold ?? 10,
          itemType: 'fabric' as const,
        }));
        setItems(mapped);
        setLowStockItems(lowStock.map((f) => ({
          id: f.id,
          name: f.name,
          stock: (f as any).stock ?? 0,
          lowStockThreshold: (f as any).lowStockThreshold ?? 10,
          itemType: 'fabric' as const,
        })));
      }
    } catch {
      toast('error', 'Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, [isDesigner, isFabricSeller]);

  useEffect(() => {
    if (user) fetchInventory();
  }, [user, fetchInventory]);

  async function handleSaveStock(item: InventoryItem) {
    const qty = parseInt(editStock, 10);
    if (isNaN(qty) || qty < 0) {
      toast('error', 'Stock must be a non-negative number.');
      return;
    }
    setSaving(true);
    try {
      if (item.itemType === 'product') {
        await productsApi.updateStock(item.id, qty);
      } else {
        await fabricsApi.updateStock(item.id, qty);
      }
      toast('success', `${item.name} stock updated to ${qty}.`);
      setEditingId(null);
      await fetchInventory();
    } catch (err: any) {
      toast('error', err?.response?.data?.message || 'Failed to update stock.');
    } finally {
      setSaving(false);
    }
  }

  if (!isDesigner && !isFabricSeller) {
    return <div className="text-center py-20 text-neutral-500">Access denied. Only sellers can view inventory.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">Inventory Management</h1>

      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h2 className="font-semibold text-amber-800 mb-2">⚠️ Low Stock Alert ({lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''})</h2>
          <ul className="text-sm text-amber-700 space-y-1">
            {lowStockItems.map((item) => (
              <li key={item.id}>• <strong>{item.name}</strong>: {item.stock} remaining (threshold: {item.lowStockThreshold})</li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-10 text-neutral-500">No {isDesigner ? 'products' : 'fabrics'} found.</div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader><h2 className="font-semibold text-neutral-900">{isDesigner ? 'Products' : 'Fabrics'} ({items.length})</h2></CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Stock</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item) => {
                    const status = getStockStatus(item.stock, item.lowStockThreshold);
                    return (
                      <tr key={item.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 font-medium text-neutral-900">{item.name}</td>
                        <td className="px-4 py-3">
                          {editingId === item.id ? (
                            <input
                              type="number"
                              min={0}
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-24 border border-neutral-300 rounded px-2 py-1 text-sm"
                              autoFocus
                            />
                          ) : (
                            <button
                              onClick={() => { setEditingId(item.id); setEditStock(String(item.stock)); }}
                              className="text-neutral-700 hover:text-indigo-600 font-medium underline underline-offset-2"
                              title="Click to edit"
                            >
                              {item.stock}
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STOCK_BADGE[status]}>{STOCK_LABEL[status]}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {editingId === item.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveStock(item)}
                                disabled={saving}
                                className="text-sm text-green-600 hover:text-green-800 font-medium"
                              >
                                {saving ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-sm text-neutral-500 hover:text-neutral-700"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingId(item.id); setEditStock(String(item.stock)); }}
                              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              Edit Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
