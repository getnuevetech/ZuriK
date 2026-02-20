export type SizeLabel = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '3XL';

export interface SizeRange {
  chest: { min: number; max: number };
  waist: { min: number; max: number };
  hips: { min: number; max: number };
}

export interface SizeEntry {
  label: SizeLabel;
  cm: SizeRange;
  inches: SizeRange;
}

export interface SizeRecommendation {
  size: SizeLabel;
  confidence: 'perfect' | 'between-up' | 'between-down' | 'outside';
  message: string;
  sizeUp?: SizeLabel;
  sizeDown?: SizeLabel;
}

export interface MeasurementInput {
  chest?: number;
  waist?: number;
  hips?: number;
  unit?: 'cm' | 'inches';
}

// Standard size chart (all values in cm; inch ranges derived proportionally)
export const SIZE_CHART: SizeEntry[] = [
  {
    label: 'XS',
    cm: { chest: { min: 76, max: 82 }, waist: { min: 60, max: 66 }, hips: { min: 84, max: 88 } },
    inches: { chest: { min: 30, max: 32 }, waist: { min: 23.5, max: 26 }, hips: { min: 33, max: 34.5 } },
  },
  {
    label: 'S',
    cm: { chest: { min: 82, max: 88 }, waist: { min: 66, max: 72 }, hips: { min: 88, max: 94 } },
    inches: { chest: { min: 32, max: 34.5 }, waist: { min: 26, max: 28 }, hips: { min: 34.5, max: 37 } },
  },
  {
    label: 'M',
    cm: { chest: { min: 88, max: 96 }, waist: { min: 72, max: 80 }, hips: { min: 94, max: 102 } },
    inches: { chest: { min: 34.5, max: 38 }, waist: { min: 28, max: 31.5 }, hips: { min: 37, max: 40 } },
  },
  {
    label: 'L',
    cm: { chest: { min: 96, max: 104 }, waist: { min: 80, max: 88 }, hips: { min: 102, max: 110 } },
    inches: { chest: { min: 38, max: 41 }, waist: { min: 31.5, max: 34.5 }, hips: { min: 40, max: 43 } },
  },
  {
    label: 'XL',
    cm: { chest: { min: 104, max: 114 }, waist: { min: 88, max: 98 }, hips: { min: 110, max: 120 } },
    inches: { chest: { min: 41, max: 45 }, waist: { min: 34.5, max: 38.5 }, hips: { min: 43, max: 47 } },
  },
  {
    label: 'XXL',
    cm: { chest: { min: 114, max: 124 }, waist: { min: 98, max: 108 }, hips: { min: 120, max: 130 } },
    inches: { chest: { min: 45, max: 49 }, waist: { min: 38.5, max: 42.5 }, hips: { min: 47, max: 51 } },
  },
  {
    label: '3XL',
    cm: { chest: { min: 124, max: 136 }, waist: { min: 108, max: 120 }, hips: { min: 130, max: 142 } },
    inches: { chest: { min: 49, max: 53.5 }, waist: { min: 42.5, max: 47 }, hips: { min: 51, max: 56 } },
  },
];

function fits(value: number, range: { min: number; max: number }): boolean {
  return value >= range.min && value <= range.max;
}

function score(value: number, range: { min: number; max: number }): number {
  if (fits(value, range)) return 0;
  return value < range.min ? range.min - value : value - range.max;
}

export function getRecommendedSize(input: MeasurementInput): SizeRecommendation | null {
  const unit = input.unit ?? 'cm';
  const { chest, waist, hips } = input;

  if (!chest && !waist && !hips) return null;

  let bestIdx = -1;
  let bestScore = Infinity;

  SIZE_CHART.forEach((entry, idx) => {
    const ranges = unit === 'cm' ? entry.cm : entry.inches;
    let s = 0;
    if (chest) s += score(chest, ranges.chest);
    if (waist) s += score(waist, ranges.waist);
    if (hips) s += score(hips, ranges.hips);
    if (s < bestScore) {
      bestScore = s;
      bestIdx = idx;
    }
  });

  if (bestIdx === -1) return null;

  const entry = SIZE_CHART[bestIdx];
  const ranges = unit === 'cm' ? entry.cm : entry.inches;

  const chestFits = !chest || fits(chest, ranges.chest);
  const waistFits = !waist || fits(waist, ranges.waist);
  const hipsFits = !hips || fits(hips, ranges.hips);
  const allFit = chestFits && waistFits && hipsFits;

  const sizeUp = bestIdx < SIZE_CHART.length - 1 ? SIZE_CHART[bestIdx + 1].label : undefined;
  const sizeDown = bestIdx > 0 ? SIZE_CHART[bestIdx - 1].label : undefined;

  if (allFit) {
    return {
      size: entry.label,
      confidence: 'perfect',
      message: `Perfect fit — ${entry.label} is your size`,
      sizeUp,
      sizeDown,
    };
  }

  // Determine if measurements are on the larger side (size up recommended)
  const chestHigh = chest ? chest > ranges.chest.max : false;
  const waistHigh = waist ? waist > ranges.waist.max : false;
  const hipsHigh = hips ? hips > ranges.hips.max : false;
  const anyHigh = chestHigh || waistHigh || hipsHigh;

  if (anyHigh) {
    return {
      size: entry.label,
      confidence: 'between-up',
      message: sizeUp
        ? `Between sizes — we recommend sizing up to ${sizeUp}`
        : `We recommend size ${entry.label} (largest available)`,
      sizeUp,
      sizeDown,
    };
  }

  return {
    size: entry.label,
    confidence: 'between-down',
    message: sizeDown
      ? `Between sizes — we recommend sizing down to ${sizeDown}`
      : `We recommend size ${entry.label} (smallest available)`,
    sizeUp,
    sizeDown,
  };
}

export function getSizeChart(): SizeEntry[] {
  return SIZE_CHART;
}
