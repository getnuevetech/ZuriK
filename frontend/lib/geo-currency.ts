export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: 'NGN',
  GH: 'GHS',
  KE: 'KES',
  ZA: 'ZAR',
  EG: 'EGP',
  MA: 'MAD',
  SN: 'XOF',
  CI: 'XOF',
  ML: 'XOF',
  BF: 'XOF',
  NE: 'XOF',
  TG: 'XOF',
  BJ: 'XOF',
  ET: 'ETB',
  TZ: 'TZS',
  UG: 'UGX',
  RW: 'RWF',
  CM: 'XAF',
  CD: 'CDF',
  GB: 'GBP',
  US: 'USD',
  // EU countries
  AT: 'EUR',
  BE: 'EUR',
  CY: 'EUR',
  EE: 'EUR',
  FI: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  IT: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  MT: 'EUR',
  NL: 'EUR',
  PT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  ES: 'EUR',
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'GHS', label: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'ZAR', label: 'South African Rand', symbol: 'R' },
  { code: 'EGP', label: 'Egyptian Pound', symbol: 'E£' },
  { code: 'MAD', label: 'Moroccan Dirham', symbol: 'MAD' },
  { code: 'XOF', label: 'West African CFA', symbol: 'CFA' },
  { code: 'XAF', label: 'Central African CFA', symbol: 'FCFA' },
  { code: 'ETB', label: 'Ethiopian Birr', symbol: 'Br' },
  { code: 'TZS', label: 'Tanzanian Shilling', symbol: 'TSh' },
];

export async function detectCurrencyByGeo(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();
    const countryCode: string = data?.country_code ?? '';
    return COUNTRY_CURRENCY_MAP[countryCode] ?? 'USD';
  } catch {
    return 'USD';
  }
}
