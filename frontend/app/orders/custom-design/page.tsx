'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { designsApi, fabricsApi, ordersApi } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { PriceDisplay } from '../../../components/common/PriceDisplay';
import { SearchBar } from '../../../components/common/SearchBar';
import { TryOnPreview } from '../../../components/try-on';
import type { Design, Fabric, CreateCustomDesignOrderDto } from '../../../types';

const STEPS = ['Select Design', 'Select Fabric', 'Measurements', 'Preview', 'Review & Confirm'];

interface Measurements {
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  sleeveLength: string;
  length: string;
  unit: string;
  measurementNotes: string;
}

function CustomDesignContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [fabricChosenByDesigner, setFabricChosenByDesigner] = useState(false);
  const [measurements, setMeasurements] = useState<Measurements>({
    chest: '', waist: '', hips: '', shoulder: '', sleeveLength: '', length: '',
    unit: 'cm', measurementNotes: '',
  });
  const [customerNotes, setCustomerNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [fabricSearch, setFabricSearch] = useState('');

  const preselectedDesignId = searchParams.get('designId');
  const preselectedFabricId = searchParams.get('fabricId');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/orders/custom-design');
      return;
    }
    Promise.all([designsApi.list(), fabricsApi.list()])
      .then(([designsRes, fabsRes]) => {
        setDesigns(designsRes.items);
        setFabrics(fabsRes.items);
        if (preselectedDesignId) {
          const design = designsRes.items.find((p: Design) => p.id === preselectedDesignId);
          if (design) { setSelectedDesign(design); setStep(1); }
        }
        if (preselectedFabricId) {
          const fabric = fabsRes.items.find((f: Fabric) => f.id === preselectedFabricId);
          if (fabric) setSelectedFabric(fabric);
        }
      })
      .catch(() => toast('error', 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading, router, toast, preselectedDesignId, preselectedFabricId]);

  const filteredProducts = designs.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  const filteredFabrics = fabrics.filter((f) => {
    if (!fabricSearch) return true;
    const q = fabricSearch.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q);
  });

  const handleMeasurementChange = (field: keyof Measurements) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setMeasurements((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!selectedDesign) return;
    if (!selectedFabric && !fabricChosenByDesigner) return;
    setSubmitting(true);
    try {
      const dto: CreateCustomDesignOrderDto = {
        designId: selectedDesign.id,
        fabricId: selectedFabric?.id,
        fabricChosenByDesigner: fabricChosenByDesigner || undefined,
        chest: Number(measurements.chest),
        waist: Number(measurements.waist),
        hips: Number(measurements.hips),
        shoulder: Number(measurements.shoulder),
        sleeveLength: Number(measurements.sleeveLength),
        length: Number(measurements.length),
        unit: measurements.unit,
        measurementNotes: measurements.measurementNotes || undefined,
        customerNotes: customerNotes || undefined,
      };
      const order = await ordersApi.createCustomDesign(dto);
      toast('success', 'Order placed successfully!');
      router.push(`/orders/confirmation?orderId=${order.id}`);
    } catch {
      toast('error', 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const measurementsValid = measurements.chest && measurements.waist && measurements.hips &&
    measurements.shoulder && measurements.sleeveLength && measurements.length;

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-2">Custom Design Order</h1>
        <p className="text-neutral-500">Create your perfect tailored outfit</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center mb-10 overflow-x-auto">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={[
                'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                idx < step ? 'bg-primary-600 border-primary-600 text-white' : '',
                idx === step ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-100' : '',
                idx > step ? 'bg-white border-neutral-300 text-neutral-400' : '',
              ].join(' ')}>
                {idx < step ? '✓' : idx + 1}
              </div>
              <span className={`mt-1 text-xs text-center max-w-20 leading-tight ${idx === step ? 'font-semibold text-primary-700' : 'text-neutral-400'}`}>
                {s}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 mt-[-14px] ${idx < step ? 'bg-primary-600' : 'bg-neutral-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 0: Select Design */}
      {step === 0 && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-4">Choose a Design</h2>
          <div className="mb-4">
            <SearchBar onSearch={setProductSearch} placeholder="Search designs..." />
          </div>
          {filteredProducts.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">No designs found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => { setSelectedDesign(product); setStep(1); }}
                  className={[
                    'text-left rounded-xl border-2 overflow-hidden transition-all hover:shadow-md',
                    selectedDesign?.id === product.id ? 'border-primary-600 shadow-md' : 'border-neutral-200',
                  ].join(' ')}
                >
                  <div className="relative h-40 bg-gradient-to-br from-primary-100 to-accent-100">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">👗</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-neutral-900 text-sm line-clamp-1">{product.name}</p>
                    <p className="text-secondary-600 font-semibold text-sm mt-1">
                      <PriceDisplay amount={product.customerPrice} />
                    </p>
                    {product.category && <Badge variant="primary" className="mt-1 text-xs">{product.category}</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Select Fabric */}
      {step === 1 && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-2">Choose a Fabric</h2>
          <p className="text-sm text-neutral-500 mb-4">
            Select a fabric yourself, or let the designer choose the best match for you.
          </p>
          {selectedDesign && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
              <span className="text-2xl">👗</span>
              <div>
                <p className="text-sm font-medium text-primary-800">{selectedDesign.name}</p>
                <PriceDisplay amount={selectedDesign.customerPrice} className="text-xs text-primary-600" />
              </div>
              <button onClick={() => { setSelectedDesign(null); setStep(0); }} className="ml-auto text-xs text-primary-600 hover:underline">Change</button>
            </div>
          )}

          {/* Let designer choose option */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={fabricChosenByDesigner}
                onChange={(e) => {
                  setFabricChosenByDesigner(e.target.checked);
                  if (e.target.checked) setSelectedFabric(null);
                }}
                className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-neutral-300"
              />
              <div>
                <span className="text-sm font-semibold text-amber-900">Let the designer choose the fabric</span>
                <p className="text-xs text-amber-700 mt-0.5">
                  The designer will select the most suitable fabric based on your design and measurements.
                </p>
              </div>
            </label>
          </div>

          {!fabricChosenByDesigner && (
            <>
              <div className="mb-4">
                <SearchBar onSearch={setFabricSearch} placeholder="Search fabrics..." />
              </div>
              {filteredFabrics.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No matching fabrics found</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {filteredFabrics.map((fabric) => (
                <button
                  key={fabric.id}
                  onClick={() => { if (fabric.stock > 0) { setSelectedFabric(fabric); setStep(2); } }}
                  disabled={fabric.stock === 0}
                  className={[
                    'text-left rounded-xl border-2 overflow-hidden transition-all',
                    fabric.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md',
                    selectedFabric?.id === fabric.id ? 'border-primary-600 shadow-md' : 'border-neutral-200',
                  ].join(' ')}
                >
                  <div className="relative h-40 bg-gradient-to-br from-secondary-100 to-accent-100">
                    {fabric.images?.[0] ? (
                      <Image src={fabric.images[0]} alt={fabric.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">🧵</div>
                    )}
                    {fabric.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold bg-black/60 px-2 py-1 rounded">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-neutral-900 text-sm line-clamp-1">{fabric.name}</p>
                    <p className="text-secondary-600 font-semibold text-sm mt-1"><PriceDisplay amount={fabric.customerPrice} /></p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {fabric.material && <Badge variant="secondary" className="text-xs">{fabric.material}</Badge>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
            </>
          )}
          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
            {fabricChosenByDesigner && (
              <Button onClick={() => setStep(2)}>Continue to Measurements →</Button>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Measurements */}
      {step === 2 && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-4">Enter Your Measurements</h2>
          {fabricChosenByDesigner ? (
            <div className="flex items-center gap-3 mb-6 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-2xl">🎨</span>
              <div>
                <p className="text-sm font-medium text-amber-800">Fabric: Designer's choice</p>
                <p className="text-xs text-amber-600">The designer will pick the fabric</p>
              </div>
              <button onClick={() => setStep(1)} className="ml-auto text-xs text-amber-600 hover:underline">Change</button>
            </div>
          ) : selectedFabric ? (
            <div className="flex items-center gap-3 mb-6 p-3 bg-secondary-50 rounded-xl border border-secondary-100">
              <span className="text-2xl">🧵</span>
              <div>
                <p className="text-sm font-medium text-secondary-800">{selectedFabric.name}</p>
                <PriceDisplay amount={selectedFabric.customerPrice} className="text-xs text-secondary-600" />
              </div>
              <button onClick={() => { setSelectedFabric(null); setStep(1); }} className="ml-auto text-xs text-secondary-600 hover:underline">Change</button>
            </div>
          ) : null}
          <div className="mb-4">
            <Select
              label="Unit"
              value={measurements.unit}
              onChange={handleMeasurementChange('unit') as React.ChangeEventHandler<HTMLSelectElement>}
              options={[{ value: 'cm', label: 'Centimeters (cm)' }, { value: 'inches', label: 'Inches (in)' }]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { field: 'chest' as const, label: 'Chest' },
              { field: 'waist' as const, label: 'Waist' },
              { field: 'hips' as const, label: 'Hips' },
              { field: 'shoulder' as const, label: 'Shoulder' },
              { field: 'sleeveLength' as const, label: 'Sleeve Length' },
              { field: 'length' as const, label: 'Total Length' },
            ].map(({ field, label }) => (
              <Input
                key={field}
                label={`${label} (${measurements.unit})`}
                type="number"
                placeholder={`Enter ${label.toLowerCase()}`}
                value={measurements[field]}
                onChange={handleMeasurementChange(field) as React.ChangeEventHandler<HTMLInputElement>}
                required
                min="0"
              />
            ))}
          </div>
          <Textarea
            label="Measurement Notes (optional)"
            placeholder="Any special notes about your measurements..."
            value={measurements.measurementNotes}
            onChange={handleMeasurementChange('measurementNotes') as React.ChangeEventHandler<HTMLTextAreaElement>}
            rows={3}
            className="mb-6"
          />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={() => setStep(3)} disabled={!measurementsValid}>Preview →</Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && selectedDesign && selectedFabric && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-4">Preview Your Design</h2>
          <TryOnPreview
            mode="custom-design"
            product={selectedDesign}
            fabric={selectedFabric}
            measurements={{
              chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
              waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
              hips: measurements.hips ? parseFloat(measurements.hips) : undefined,
              shoulder: measurements.shoulder ? parseFloat(measurements.shoulder) : undefined,
              sleeveLength: measurements.sleeveLength ? parseFloat(measurements.sleeveLength) : undefined,
              length: measurements.length ? parseFloat(measurements.length) : undefined,
              unit: measurements.unit,
            }}
          />
          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={() => setStep(2)}>← Back to Measurements</Button>
            <Button onClick={() => setStep(4)}>Looks Good →</Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Confirm */}
      {step === 4 && selectedDesign && (selectedFabric || fabricChosenByDesigner) && (
        <div>
          <h2 className="font-heading text-xl font-semibold text-neutral-800 mb-6">Review Your Order</h2>
          <div className="space-y-4 mb-6">
            <Card>
              <CardHeader><h3 className="font-medium text-neutral-800">Design</h3></CardHeader>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 flex-shrink-0">
                    {selectedDesign.images?.[0] ? (
                      <Image src={selectedDesign.images[0]} alt={selectedDesign.name} fill className="object-cover" sizes="64px" />
                    ) : <span className="absolute inset-0 flex items-center justify-center text-2xl">👗</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900">{selectedDesign.name}</p>
                    {selectedDesign.designer?.country && <p className="text-sm text-neutral-500">{selectedDesign.designer.country}</p>}
                  </div>
                  <PriceDisplay amount={selectedDesign.customerPrice} className="font-semibold" />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-medium text-neutral-800">Fabric</h3></CardHeader>
              <CardBody>
                {fabricChosenByDesigner ? (
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🎨</span>
                    <div>
                      <p className="font-medium text-neutral-900">Designer's choice</p>
                      <p className="text-sm text-neutral-500">The designer will select the best fabric</p>
                    </div>
                  </div>
                ) : selectedFabric ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-secondary-100 to-accent-100 flex-shrink-0">
                      {selectedFabric.images?.[0] ? (
                        <Image src={selectedFabric.images[0]} alt={selectedFabric.name} fill className="object-cover" sizes="64px" />
                      ) : <span className="absolute inset-0 flex items-center justify-center text-2xl">🧵</span>}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{selectedFabric.name}</p>
                      <p className="text-sm text-neutral-500">{selectedFabric.material}</p>
                    </div>
                    <PriceDisplay amount={selectedFabric.customerPrice} className="font-semibold" />
                  </div>
                ) : null}
              </CardBody>
            </Card>

            <Card>
              <CardHeader><h3 className="font-medium text-neutral-800">Measurements ({measurements.unit})</h3></CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  {[
                    ['Chest', measurements.chest],
                    ['Waist', measurements.waist],
                    ['Hips', measurements.hips],
                    ['Shoulder', measurements.shoulder],
                    ['Sleeve Length', measurements.sleeveLength],
                    ['Length', measurements.length],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-neutral-500 text-xs">{label}</p>
                      <p className="font-medium">{value} {measurements.unit}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-neutral-800">Price Summary</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Design</span>
                  <PriceDisplay amount={selectedDesign.customerPrice} />
                </div>
                {selectedFabric && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Fabric</span>
                    <PriceDisplay amount={selectedFabric.customerPrice} />
                  </div>
                )}
                <div className="flex justify-between font-bold pt-2 border-t border-neutral-200">
                  <span>Estimated Total</span>
                  <PriceDisplay amount={selectedDesign.customerPrice + (selectedFabric?.customerPrice ?? 0)} />
                </div>
              </CardBody>
            </Card>

            <Textarea
              label="Customer Notes (optional)"
              placeholder="Any special instructions or notes..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStep(3)}>← Back</Button>
            <Button onClick={handleSubmit} loading={submitting} className="flex-1">
              Place Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomDesignPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <CustomDesignContent />
    </Suspense>
  );
}
