'use client';

import React from 'react';

export interface BodyMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeveLength?: number;
  length?: number;
  unit?: string;
}

interface BodySilhouetteProps {
  measurements?: BodyMeasurements;
  showAnnotations?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

// Average proportions baseline (cm)
const DEFAULTS = {
  chest: 92,
  waist: 76,
  hips: 98,
  shoulder: 42,
  sleeveLength: 62,
  length: 110,
};

// Map measurement value to a 0..1 scale factor relative to defaults
function scale(value: number | undefined, defaultValue: number, minFactor = 0.8, maxFactor = 1.2): number {
  if (!value || value <= 0) return 1;
  const raw = value / defaultValue;
  return Math.max(minFactor, Math.min(maxFactor, raw));
}

export function BodySilhouette({
  measurements = {},
  showAnnotations = true,
  className = '',
  width = 200,
  height = 380,
}: BodySilhouetteProps) {
  const chestScale = scale(measurements.chest, DEFAULTS.chest);
  const waistScale = scale(measurements.waist, DEFAULTS.waist);
  const hipsScale = scale(measurements.hips, DEFAULTS.hips);
  const shoulderScale = scale(measurements.shoulder, DEFAULTS.shoulder);
  const lengthScale = scale(measurements.length, DEFAULTS.length, 0.85, 1.15);

  // SVG coordinate system: viewBox 0 0 200 380
  // Center x = 100
  const cx = 100;

  // Key Y positions (scaled by length)
  const headTop = 10;
  const headBottom = 52;
  const neckTop = headBottom;
  const neckBottom = 64;
  const shoulderY = neckBottom;
  const chestY = 100 * lengthScale;
  const waistY = 160 * lengthScale;
  const hipsY = 200 * lengthScale;
  const hemY = Math.min(360, 280 * lengthScale);

  // Half-widths at key points
  const shoulderHalf = 45 * shoulderScale;
  const chestHalf = 38 * chestScale;
  const waistHalf = 26 * waistScale;
  const hipsHalf = 40 * hipsScale;
  const hemHalf = hipsHalf * 0.95;

  // Neck half-width
  const neckHalf = 10;

  // Head
  const headCy = (headTop + headBottom) / 2;
  const headRy = (headBottom - headTop) / 2;
  const headRx = 18;

  // Body outline path (front silhouette)
  const bodyPath = [
    // Left shoulder from neck
    `M ${cx - neckHalf} ${neckBottom}`,
    // Left shoulder curve out
    `C ${cx - neckHalf - 6} ${shoulderY}, ${cx - shoulderHalf} ${shoulderY}, ${cx - shoulderHalf} ${shoulderY + 4}`,
    // Left side down to chest
    `C ${cx - shoulderHalf} ${chestY - 10}, ${cx - chestHalf} ${chestY}, ${cx - chestHalf} ${chestY}`,
    // Left side in to waist
    `C ${cx - chestHalf} ${waistY - 20}, ${cx - waistHalf} ${waistY}, ${cx - waistHalf} ${waistY}`,
    // Left side out to hips
    `C ${cx - waistHalf} ${hipsY - 10}, ${cx - hipsHalf} ${hipsY}, ${cx - hipsHalf} ${hipsY}`,
    // Left hem
    `L ${cx - hemHalf} ${hemY}`,
    // Bottom hem
    `L ${cx + hemHalf} ${hemY}`,
    // Right side up from hem to hips
    `L ${cx + hipsHalf} ${hipsY}`,
    // Right hips to waist
    `C ${cx + hipsHalf} ${hipsY - 10}, ${cx + waistHalf} ${waistY}, ${cx + waistHalf} ${waistY}`,
    // Right waist to chest
    `C ${cx + waistHalf} ${waistY - 20}, ${cx + chestHalf} ${chestY}, ${cx + chestHalf} ${chestY}`,
    // Right chest to shoulder
    `C ${cx + chestHalf} ${chestY - 10}, ${cx + shoulderHalf} ${shoulderY + 4}, ${cx + shoulderHalf} ${shoulderY + 4}`,
    // Right shoulder to neck
    `C ${cx + shoulderHalf} ${shoulderY}, ${cx + neckHalf + 6} ${shoulderY}, ${cx + neckHalf} ${neckBottom}`,
    'Z',
  ].join(' ');

  // Neck rectangle path
  const neckPath = `M ${cx - neckHalf} ${neckTop} L ${cx + neckHalf} ${neckTop} L ${cx + neckHalf} ${neckBottom} L ${cx - neckHalf} ${neckBottom} Z`;

  const annotationColor = '#fbbf24'; // secondary-400
  const bodyColor = '#4f46e5'; // primary-600
  const textColor = '#78716c'; // neutral-500

  const unit = measurements.unit ?? 'cm';

  return (
    <svg
      viewBox="0 0 200 380"
      width={width}
      height={height}
      className={className}
      aria-label="Body silhouette"
      role="img"
    >
      {/* Head */}
      <ellipse
        cx={cx}
        cy={headCy}
        rx={headRx}
        ry={headRy}
        fill="none"
        stroke={bodyColor}
        strokeWidth="2.5"
      />

      {/* Neck */}
      <path d={neckPath} fill="#e0e7ff" stroke={bodyColor} strokeWidth="2" />

      {/* Body */}
      <path
        d={bodyPath}
        fill="#eef2ff"
        stroke={bodyColor}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {showAnnotations && (
        <g>
          {/* Chest annotation */}
          <line
            x1={cx - chestHalf - 4}
            y1={chestY}
            x2={cx + chestHalf + 4}
            y2={chestY}
            stroke={annotationColor}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <line x1={cx - chestHalf - 4} y1={chestY - 5} x2={cx - chestHalf - 4} y2={chestY + 5} stroke={annotationColor} strokeWidth="1.5" />
          <line x1={cx + chestHalf + 4} y1={chestY - 5} x2={cx + chestHalf + 4} y2={chestY + 5} stroke={annotationColor} strokeWidth="1.5" />
          <text x={cx + chestHalf + 8} y={chestY + 4} fontSize="8" fill={textColor} fontFamily="sans-serif">
            {measurements.chest ? `${measurements.chest}${unit}` : 'Chest'}
          </text>

          {/* Waist annotation */}
          <line
            x1={cx - waistHalf - 4}
            y1={waistY}
            x2={cx + waistHalf + 4}
            y2={waistY}
            stroke={annotationColor}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <line x1={cx - waistHalf - 4} y1={waistY - 5} x2={cx - waistHalf - 4} y2={waistY + 5} stroke={annotationColor} strokeWidth="1.5" />
          <line x1={cx + waistHalf + 4} y1={waistY - 5} x2={cx + waistHalf + 4} y2={waistY + 5} stroke={annotationColor} strokeWidth="1.5" />
          <text x={cx + waistHalf + 8} y={waistY + 4} fontSize="8" fill={textColor} fontFamily="sans-serif">
            {measurements.waist ? `${measurements.waist}${unit}` : 'Waist'}
          </text>

          {/* Hips annotation */}
          <line
            x1={cx - hipsHalf - 4}
            y1={hipsY}
            x2={cx + hipsHalf + 4}
            y2={hipsY}
            stroke={annotationColor}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <line x1={cx - hipsHalf - 4} y1={hipsY - 5} x2={cx - hipsHalf - 4} y2={hipsY + 5} stroke={annotationColor} strokeWidth="1.5" />
          <line x1={cx + hipsHalf + 4} y1={hipsY - 5} x2={cx + hipsHalf + 4} y2={hipsY + 5} stroke={annotationColor} strokeWidth="1.5" />
          <text x={cx + hipsHalf + 8} y={hipsY + 4} fontSize="8" fill={textColor} fontFamily="sans-serif">
            {measurements.hips ? `${measurements.hips}${unit}` : 'Hips'}
          </text>

          {/* Shoulder annotation */}
          <line
            x1={cx - shoulderHalf}
            y1={shoulderY + 2}
            x2={cx + shoulderHalf}
            y2={shoulderY + 2}
            stroke={annotationColor}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <text x={cx - shoulderHalf} y={shoulderY - 4} fontSize="8" fill={textColor} fontFamily="sans-serif">
            {measurements.shoulder ? `${measurements.shoulder}${unit}` : 'Shoulder'}
          </text>

          {/* Length annotation */}
          <line
            x1={cx + hipsHalf + 18}
            y1={neckBottom}
            x2={cx + hipsHalf + 18}
            y2={hemY}
            stroke={annotationColor}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
          <line x1={cx + hipsHalf + 13} y1={neckBottom} x2={cx + hipsHalf + 23} y2={neckBottom} stroke={annotationColor} strokeWidth="1.5" />
          <line x1={cx + hipsHalf + 13} y1={hemY} x2={cx + hipsHalf + 23} y2={hemY} stroke={annotationColor} strokeWidth="1.5" />
          <text x={cx + hipsHalf + 21} y={(neckBottom + hemY) / 2 + 4} fontSize="8" fill={textColor} fontFamily="sans-serif">
            {measurements.length ? `${measurements.length}${unit}` : 'Length'}
          </text>
        </g>
      )}
    </svg>
  );
}
