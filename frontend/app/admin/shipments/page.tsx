'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { shippingApi, type ShipmentTracking } from '../../../lib/api';
import AdminPageHeader from '../../../components/admin/AdminPageHeader';
import DataTable from '../../../components/admin/DataTable';
import FilterSelect from '../../../components/admin/FilterSelect';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useToast } from '../../../components/ui/Toast';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: '⏳ Pending' },
  { value: 'processing', label: '🔄 Processing' },
  { value: 'shipped', label: '📦 Shipped' },
  { value: 'in_transit', label: '🚚 In Transit' },
  { value: 'out_for_delivery', label: '🏍️ Out for Delivery' },
  { value: 'delivered', label: '✅ Delivered' },
  { value: 'failed', label: '❌ Failed' },
  { value: 'returned', label: '↩️ Returned' },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' }> = {
  pending:           { label: '⏳ Pending',          variant: 'secondary' },
  processing:        { label: '🔄 Processing',       variant: 'primary' },
  shipped:           { label: '📦 Shipped',          variant: 'primary' },
  in_transit:        { label: '🚚 In Transit',       variant: 'primary' },
  out_for_delivery:  { label: '🏍️ Out for Delivery', variant: 'warning' },
  delivered:         { label: '✅ Delivered',        variant: 'success' },
  failed:            { label: '❌ Failed',           variant: 'danger' },
  returned:          { label: '↩️ Returned',         variant: 'warning' },
};

interface UpdateStatusForm { status: string; description: string; location: string; }
interface AssignTrackingForm { trackingNumber: string; carrier: string; carrierTrackingUrl: string; }

export default function AdminShipmentsPage() {
  const [shipments, setShipments] = useState<ShipmentTracking[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };
  const [statusModal, setStatusModal] = useState<ShipmentTracking | null>(null);
  const [trackingModal, setTrackingModal] = useState<ShipmentTracking | null>(null);
  const [statusForm, setStatusForm] = useState<UpdateStatusForm>({ status: '', description: '', location: '' });
  const [trackingForm, setTrackingForm] = useState<AssignTrackingForm>({ trackingNumber: '', carrier: '', carrierTrackingUrl: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const limit = 20;

  const fetchShipments = useCallback(() => {
    setLoading(true);
    shippingApi
      .listShipments(page, limit, statusFilter || undefined)
      .then((res) => {
        setShipments(res.items);
        setTotal(res.total);
        setTotalPages(Math.ceil(res.total / limit));
      })
      .catch(() => toast('error', 'Failed to load shipments'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, toast]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const openStatusModal = (shipment: ShipmentTracking) => {
    setStatusModal(shipment);
    setStatusForm({ status: shipment.status, description: '', location: '' });
  };

  const openTrackingModal = (shipment: ShipmentTracking) => {
    setTrackingModal(shipment);
    setTrackingForm({
      trackingNumber: shipment.trackingNumber ?? '',
      carrier: shipment.carrier ?? '',
      carrierTrackingUrl: shipment.carrierTrackingUrl ?? '',
    });
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModal) return;
    setSaving(true);
    try {
      await shippingApi.updateShipmentStatus(statusModal.id, {
        status: statusForm.status,
        description: statusForm.description,
        location: statusForm.location || undefined,
      });
      toast('success', 'Shipment status updated');
      setStatusModal(null);
      fetchShipments();
    } catch {
      toast('error', 'Failed to update shipment status');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingModal) return;
    setSaving(true);
    try {
      await shippingApi.assignTracking(trackingModal.id, {
        trackingNumber: trackingForm.trackingNumber,
        carrier: trackingForm.carrier,
        carrierTrackingUrl: trackingForm.carrierTrackingUrl || undefined,
      });
      toast('success', 'Tracking info assigned');
      setTrackingModal(null);
      fetchShipments();
    } catch {
      toast('error', 'Failed to assign tracking info');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'orderId', header: 'Order ID', render: (row: ShipmentTracking) => <span className="font-mono text-xs">{row.orderId.slice(0, 8)}…</span> },
    { key: 'method', header: 'Method', render: (row: ShipmentTracking) => row.shippingMethod?.name ?? '—' },
    {
      key: 'status', header: 'Status',
      render: (row: ShipmentTracking) => {
        const cfg = STATUS_BADGE[row.status];
        return cfg ? <Badge variant={cfg.variant}>{cfg.label}</Badge> : <Badge>{row.status}</Badge>;
      },
    },
    { key: 'carrier', header: 'Carrier', render: (row: ShipmentTracking) => row.carrier ?? '—' },
    { key: 'trackingNumber', header: 'Tracking #', render: (row: ShipmentTracking) => row.trackingNumber ? <span className="font-mono text-xs">{row.trackingNumber}</span> : '—' },
    { key: 'shippedAt', header: 'Shipped', render: (row: ShipmentTracking) => row.shippedAt ? new Date(row.shippedAt).toLocaleDateString() : '—' },
    {
      key: 'actions', header: 'Actions',
      render: (row: ShipmentTracking) => (
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => openStatusModal(row)}>Update Status</Button>
          <Button size="sm" variant="outline" onClick={() => openTrackingModal(row)}>Assign Tracking</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Shipments" />

      <div className="mb-4">
        <FilterSelect
          label="Filter by Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={handleStatusFilter}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <DataTable
          columns={columns}
          data={shipments}
          emptyMessage="No shipments found."
          pagination={{ page, totalPages, onPageChange: setPage }}
        />
      )}
      <p className="text-xs text-neutral-400 mt-2">Total: {total} shipments</p>

      {/* Update Status Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardBody>
              <h3 className="font-semibold text-neutral-800 mb-4">Update Shipment Status</h3>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status *</label>
                  <select
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value }))}
                    required
                  >
                    {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <Input label="Description *" value={statusForm.description} onChange={(e) => setStatusForm((f) => ({ ...f, description: e.target.value }))} required placeholder="e.g. Package picked up from warehouse" />
                <Input label="Location" value={statusForm.location} onChange={(e) => setStatusForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Lagos, Nigeria" />
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>Update</Button>
                  <Button type="button" variant="outline" onClick={() => setStatusModal(null)}>Cancel</Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Assign Tracking Modal */}
      {trackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <CardBody>
              <h3 className="font-semibold text-neutral-800 mb-4">Assign Tracking Information</h3>
              <form onSubmit={handleAssignTracking} className="space-y-4">
                <Input label="Tracking Number *" value={trackingForm.trackingNumber} onChange={(e) => setTrackingForm((f) => ({ ...f, trackingNumber: e.target.value }))} required placeholder="e.g. DHL1234567890" />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Carrier *</label>
                  <input
                    list="carriers"
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={trackingForm.carrier}
                    onChange={(e) => setTrackingForm((f) => ({ ...f, carrier: e.target.value }))}
                    required
                    placeholder="e.g. DHL Africa"
                  />
                  <datalist id="carriers">
                    {['GIG Logistics', 'Kwik', 'DHL Africa', 'FedEx', 'UPS', 'DHL Express'].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <Input label="Carrier Tracking URL" value={trackingForm.carrierTrackingUrl} onChange={(e) => setTrackingForm((f) => ({ ...f, carrierTrackingUrl: e.target.value }))} placeholder="https://track.dhl.com/..." />
                <div className="flex gap-3">
                  <Button type="submit" loading={saving}>Assign</Button>
                  <Button type="button" variant="outline" onClick={() => setTrackingModal(null)}>Cancel</Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
