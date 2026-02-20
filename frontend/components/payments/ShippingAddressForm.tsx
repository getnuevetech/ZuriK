import React from 'react';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  phone: string;
}

interface ShippingAddressFormProps {
  value: ShippingAddress;
  onChange: (address: ShippingAddress) => void;
}

const AFRICAN_COUNTRIES = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Ethiopia',
  'Tanzania',
  'Uganda',
  'Rwanda',
  'Senegal',
  "Côte d'Ivoire",
  'Cameroon',
  'Zimbabwe',
  'Zambia',
  'Mozambique',
];

const OTHER_COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Other',
];

export function ShippingAddressForm({ value, onChange }: ShippingAddressFormProps) {
  const set = (field: keyof ShippingAddress) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => onChange({ ...value, [field]: e.target.value });

  const inputClass =
    'w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const labelClass = 'block text-sm font-medium text-neutral-700 mb-1';

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Full Name *</label>
        <input
          type="text"
          value={value.fullName}
          onChange={set('fullName')}
          placeholder="John Doe"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Address Line 1 *</label>
        <input
          type="text"
          value={value.addressLine1}
          onChange={set('addressLine1')}
          placeholder="123 Main Street"
          className={inputClass}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Address Line 2 (optional)</label>
        <input
          type="text"
          value={value.addressLine2 ?? ''}
          onChange={set('addressLine2')}
          placeholder="Apartment, suite, etc."
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>City *</label>
          <input
            type="text"
            value={value.city}
            onChange={set('city')}
            placeholder="Lagos"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass}>State / Region</label>
          <input
            type="text"
            value={value.state ?? ''}
            onChange={set('state')}
            placeholder="Lagos State"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Country *</label>
          <select value={value.country} onChange={set('country')} className={inputClass} required>
            <option value="">Select country</option>
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
        <div>
          <label className={labelClass}>Postal Code</label>
          <input
            type="text"
            value={value.postalCode ?? ''}
            onChange={set('postalCode')}
            placeholder="100001"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Phone Number *</label>
        <input
          type="tel"
          value={value.phone}
          onChange={set('phone')}
          placeholder="+234 801 234 5678"
          className={inputClass}
          required
        />
      </div>
    </div>
  );
}
