'use client';

import React, { useRef, useEffect, useState } from 'react';
import type { Product } from '../../types/product';
import type { Fabric } from '../../types/fabric';
import { BodySilhouette, BodyMeasurements } from './BodySilhouette';
import { FabricOverlay } from './FabricOverlay';
import { MeasurementInput, MeasurementValues } from './MeasurementInput';
import { SizeRecommendationDisplay } from './SizeRecommendation';

export interface TryOnPreviewProps {
  mode: 'custom-design' | 'ready-to-wear';
  product?: Product | null;
  fabric?: Fabric | null;
  measurements?: Partial<BodyMeasurements>;
  onMeasurementsChange?: (m: MeasurementValues) => void;
  /** Pre-filled measurements from saved user data */
  savedMeasurements?: Partial<BodyMeasurements & { unit: string }>;
}

const MEASUREMENT_STORAGE_KEY = 'try_on_measurements';

function toBodyMeasurements(v: MeasurementValues): BodyMeasurements {
  return {
    chest: v.chest ? parseFloat(v.chest) : undefined,
    waist: v.waist ? parseFloat(v.waist) : undefined,
    hips: v.hips ? parseFloat(v.hips) : undefined,
    shoulder: v.shoulder ? parseFloat(v.shoulder) : undefined,
    sleeveLength: v.sleeveLength ? parseFloat(v.sleeveLength) : undefined,
    length: v.length ? parseFloat(v.length) : undefined,
    unit: v.unit,
  };
}

function fromBodyMeasurements(m?: Partial<BodyMeasurements & { unit: string }>): MeasurementValues {
  return {
    chest: m?.chest != null ? String(m.chest) : '',
    waist: m?.waist != null ? String(m.waist) : '',
    hips: m?.hips != null ? String(m.hips) : '',
    shoulder: m?.shoulder != null ? String(m.shoulder) : '',
    sleeveLength: m?.sleeveLength != null ? String(m.sleeveLength) : '',
    length: m?.length != null ? String(m.length) : '',
    unit: m?.unit ?? 'cm',
  };
}

export function TryOnPreview({
  mode,
  product,
  fabric,
  measurements,
  onMeasurementsChange,
  savedMeasurements,
}: TryOnPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(200);
  const [saveMeasurements, setSaveMeasurements] = useState(false);

  // Local measurement state for ready-to-wear mode (custom-design uses parent state via props)
  const [localMeasurements, setLocalMeasurements] = useState<MeasurementValues>(() => {
    // Try sessionStorage first, then savedMeasurements prop
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(MEASUREMENT_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as MeasurementValues;
        } catch {
          // ignore
        }
      }
    }
    if (savedMeasurements) return fromBodyMeasurements(savedMeasurements);
    return fromBodyMeasurements({});
  });

  // Sync savedMeasurements prop into local state when it arrives
  useEffect(() => {
    if (savedMeasurements) {
      setLocalMeasurements((prev) => {
        const anyFilled = prev.chest || prev.waist || prev.hips;
        if (anyFilled) return prev; // don't overwrite user-entered
        return fromBodyMeasurements(savedMeasurements);
      });
    }
  }, [savedMeasurements]);

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 200;
      setContainerWidth(Math.min(w, 260));
    });
    obs.observe(el);
    setContainerWidth(Math.min(el.offsetWidth, 260));
    return () => obs.disconnect();
  }, []);

  const activeMeasurements: BodyMeasurements =
    mode === 'custom-design'
      ? toBodyMeasurements(fromBodyMeasurements(measurements))
      : toBodyMeasurements(localMeasurements);

  const silhouetteHeight = Math.round(containerWidth * 1.9);

  function handleLocalMeasurementChange(v: MeasurementValues) {
    setLocalMeasurements(v);
    // Persist to sessionStorage
    sessionStorage.setItem(MEASUREMENT_STORAGE_KEY, JSON.stringify(v));
    if (saveMeasurements) {
      try {
        localStorage.setItem(MEASUREMENT_STORAGE_KEY, JSON.stringify(v));
      } catch {
        // ignore
      }
    }
    onMeasurementsChange?.(v);
  }

  function handleSaveChange(checked: boolean) {
    setSaveMeasurements(checked);
    if (checked) {
      try {
        localStorage.setItem(MEASUREMENT_STORAGE_KEY, JSON.stringify(localMeasurements));
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Preview column */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0" ref={containerRef} style={{ minWidth: 160, maxWidth: 280, width: '100%' }}>
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Preview</p>
        <div className="relative" style={{ width: containerWidth, height: silhouetteHeight }}>
          <BodySilhouette
            measurements={activeMeasurements}
            showAnnotations
            width={containerWidth}
            height={silhouetteHeight}
          />
          {mode === 'custom-design' && (
            <div className="absolute inset-0" style={{ width: containerWidth, height: silhouetteHeight }}>
              <FabricOverlay
                fabricImageUrl={fabric?.images?.[0]}
                fabricColor={fabric?.color}
                width={containerWidth}
                height={silhouetteHeight}
              />
            </div>
          )}
        </div>

        {/* Fabric info */}
        {mode === 'custom-design' && fabric && (
          <div className="text-center mt-1">
            <p className="text-xs text-neutral-600 font-medium">{fabric.name}</p>
            {fabric.color && <p className="text-xs text-neutral-400">{fabric.color} · {fabric.material}</p>}
          </div>
        )}

        {product && (
          <div className="text-center">
            <p className="text-xs text-neutral-600 font-medium">{product.name}</p>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 space-y-5">
        {mode === 'ready-to-wear' && (
          <>
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Your Measurements</h3>
              <MeasurementInput
                values={localMeasurements}
                onChange={handleLocalMeasurementChange}
                compact
                showSaveOption
                saveChecked={saveMeasurements}
                onSaveChange={handleSaveChange}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-3">Size Recommendation</h3>
              <SizeRecommendationDisplay
                chest={localMeasurements.chest ? parseFloat(localMeasurements.chest) : undefined}
                waist={localMeasurements.waist ? parseFloat(localMeasurements.waist) : undefined}
                hips={localMeasurements.hips ? parseFloat(localMeasurements.hips) : undefined}
                unit={localMeasurements.unit === 'inches' ? 'inches' : 'cm'}
              />
            </div>
          </>
        )}

        {mode === 'custom-design' && (
          <div className="text-sm text-neutral-600 bg-primary-50 rounded-xl p-4 border border-primary-100">
            <p className="font-medium text-primary-800 mb-1">Custom Fit Preview</p>
            <p>This preview shows how the selected fabric will look on your body silhouette, scaled to your measurements.</p>
            {!measurements?.chest && !measurements?.waist && !measurements?.hips && (
              <p className="mt-2 text-primary-600 text-xs">Go back to Measurements to enter your size for a personalized preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
