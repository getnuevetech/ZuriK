'use client';

import React from 'react';

const AFRICAN_COUNTRIES = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Ethiopia', 'Tanzania', 'Uganda',
  'Cameroon', 'Côte d\'Ivoire', 'Senegal', 'Rwanda', 'Zimbabwe', 'Zambia',
  'Mozambique', 'Madagascar', 'Angola', 'Namibia', 'Botswana', 'Malawi',
];

const OTHER_COUNTRIES = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'France',
  'Germany', 'Netherlands', 'Italy', 'Spain', 'Sweden',
];

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

interface ShippingAddressFormProps {
  value: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
}

function InputField({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  );
}

export function ShippingAddressForm({ value, onChange }: ShippingAddressFormProps) {
  const set = (field: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="space-y-4">
      <InputField
        label="Full Name"
        required
        placeholder="John Doe"
        value={value.fullName}
        onChange={set('fullName')}
      />
      <InputField
        label="Address Line 1"
        required
        placeholder="123 Main Street"
        value={value.addressLine1}
        onChange={set('addressLine1')}
      />
      <InputField
        label="Address Line 2"
        placeholder="Apartment, suite, etc."
        value={value.addressLine2 ?? ''}
        onChange={set('addressLine2')}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="City"
          required
          placeholder="Lagos"
          value={value.city}
          onChange={set('city')}
        />
        <InputField
          label="State / Province"
          placeholder="Lagos State"
          value={value.state ?? ''}
          onChange={set('state')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Postal Code"
          placeholder="100001"
          value={value.postalCode ?? ''}
          onChange={set('postalCode')}
        />
        <InputField
          label="Phone"
          placeholder="+234 800 000 0000"
          type="tel"
          value={value.phone ?? ''}
          onChange={set('phone')}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          value={value.country}
          onChange={set('country')}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="" disabled>Select country...</option>
          <optgroup label="African Countries">
            {AFRICAN_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
          <optgroup label="Other Countries">
            {OTHER_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
        </select>
      </div>
    </div>
  );
}
