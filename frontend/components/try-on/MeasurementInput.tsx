'use client';

import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

export interface MeasurementValues {
  chest: string;
  waist: string;
  hips: string;
  shoulder: string;
  sleeveLength: string;
  length: string;
  unit: string;
}

interface MeasurementInputProps {
  values: MeasurementValues;
  onChange: (values: MeasurementValues) => void;
  /** When true only show chest/waist/hips for size recommendation */
  compact?: boolean;
  showSaveOption?: boolean;
  saveChecked?: boolean;
  onSaveChange?: (checked: boolean) => void;
}

const FIELDS: { field: keyof Omit<MeasurementValues, 'unit'>; label: string }[] = [
  { field: 'chest', label: 'Chest' },
  { field: 'waist', label: 'Waist' },
  { field: 'hips', label: 'Hips' },
  { field: 'shoulder', label: 'Shoulder' },
  { field: 'sleeveLength', label: 'Sleeve Length' },
  { field: 'length', label: 'Total Length' },
];

const COMPACT_FIELDS: (keyof Omit<MeasurementValues, 'unit'>)[] = ['chest', 'waist', 'hips'];

export function MeasurementInput({
  values,
  onChange,
  compact = false,
  showSaveOption = false,
  saveChecked = false,
  onSaveChange,
}: MeasurementInputProps) {
  const visibleFields = compact ? FIELDS.filter((f) => COMPACT_FIELDS.includes(f.field)) : FIELDS;

  function handleField(field: keyof MeasurementValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <div className="space-y-4">
      <div className="w-40">
        <Select
          label="Unit"
          value={values.unit}
          onChange={(e) => handleField('unit', e.target.value)}
          options={[
            { value: 'cm', label: 'Centimeters (cm)' },
            { value: 'inches', label: 'Inches (in)' },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleFields.map(({ field, label }) => (
          <Input
            key={field}
            label={`${label} (${values.unit})`}
            type="number"
            placeholder={`e.g. ${field === 'chest' ? (values.unit === 'cm' ? '92' : '36') : field === 'waist' ? (values.unit === 'cm' ? '76' : '30') : '...'}`}
            value={values[field]}
            onChange={(e) => handleField(field, e.target.value)}
            min="0"
          />
        ))}
      </div>

      {showSaveOption && (
        <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={saveChecked}
            onChange={(e) => onSaveChange?.(e.target.checked)}
            className="accent-primary-600 w-4 h-4"
          />
          Save as my measurements for next time
        </label>
      )}
    </div>
  );
}
