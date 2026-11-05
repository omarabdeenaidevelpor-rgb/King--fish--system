export const supportedLocales = [
  { code: 'ar', label: 'العربية', direction: 'rtl' as const },
  { code: 'en', label: 'English', direction: 'ltr' as const },
  { code: 'it', label: 'Italiano', direction: 'ltr' as const },
  { code: 'fr', label: 'Français', direction: 'ltr' as const },
  { code: 'es', label: 'Español', direction: 'ltr' as const },
  { code: 'de', label: 'Deutsch', direction: 'ltr' as const },
];

export const supportedCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', decimals: 2 },
  { code: 'GBP', name: 'Pound Sterling', symbol: '£', decimals: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2 },
];

export const supportedTimeZones = [
  'Africa/Cairo',
  'Europe/Rome',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Riyadh',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
] as const;

export const supportedCountries = [
  { code: 'EG', name: 'Egypt', defaultCurrency: 'EGP', defaultTimeZone: 'Africa/Cairo' },
  { code: 'IT', name: 'Italy', defaultCurrency: 'EUR', defaultTimeZone: 'Europe/Rome' },
  { code: 'GB', name: 'United Kingdom', defaultCurrency: 'GBP', defaultTimeZone: 'Europe/London' },
  { code: 'AE', name: 'United Arab Emirates', defaultCurrency: 'AED', defaultTimeZone: 'Asia/Dubai' },
  { code: 'SA', name: 'Saudi Arabia', defaultCurrency: 'SAR', defaultTimeZone: 'Asia/Riyadh' },
  { code: 'US', name: 'United States', defaultCurrency: 'USD', defaultTimeZone: 'America/New_York' },
];

export function formatMoney(value: number, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatDate(value: Date | string, locale = 'en-US', timeZone = 'UTC') {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone }).format(new Date(value));
}
