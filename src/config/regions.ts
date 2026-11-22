export interface Region {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
  timezone: string;
}

// Supported countries for the DealPass club. "OTHER" is a catch-all for any
// country that is not explicitly listed, so the app truly works worldwide.
export const REGIONS: Record<string, Region> = {
  US: { code: 'US', name: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸', timezone: 'America/New_York' },
  GB: { code: 'GB', name: 'United Kingdom', currency: 'GBP', symbol: '£', flag: '🇬🇧', timezone: 'Europe/London' },
  CA: { code: 'CA', name: 'Canada', currency: 'CAD', symbol: 'CA$', flag: '🇨🇦', timezone: 'America/Toronto' },
  AU: { code: 'AU', name: 'Australia', currency: 'AUD', symbol: 'A$', flag: '🇦🇺', timezone: 'Australia/Sydney' },
  NZ: { code: 'NZ', name: 'New Zealand', currency: 'NZD', symbol: 'NZ$', flag: '🇳🇿', timezone: 'Pacific/Auckland' },
  IE: { code: 'IE', name: 'Ireland', currency: 'EUR', symbol: '€', flag: '🇮🇪', timezone: 'Europe/Dublin' },
  SG: { code: 'SG', name: 'Singapore', currency: 'SGD', symbol: 'S$', flag: '🇸🇬', timezone: 'Asia/Singapore' },
  IN: { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', flag: '🇮🇳', timezone: 'Asia/Kolkata' },
  PH: { code: 'PH', name: 'Philippines', currency: 'PHP', symbol: '₱', flag: '🇵🇭', timezone: 'Asia/Manila' },
  OTHER: { code: 'OTHER', name: 'Other', currency: 'USD', symbol: '$', flag: '🌍', timezone: 'UTC' },
};

// Fallback when we cannot detect the visitor's country (defaults to the US).
export const DEFAULT_REGION = REGIONS.US;

// Timezone -> supported country code (checked before the locale fallback).
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Pacific/Auckland': 'NZ',
  'Asia/Singapore': 'SG',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Manila': 'PH',
};

// Browser locale (lowercased) -> supported country code.
const LOCALE_TO_COUNTRY: Record<string, string> = {
  'en-us': 'US',
  'en-ca': 'CA',
  'en-gb': 'GB',
  'en-au': 'AU',
  'en-nz': 'NZ',
  'en-ie': 'IE',
  'en-sg': 'SG',
  'en-in': 'IN',
  'en-ph': 'PH',
};

// Detect a supported country code from the visitor's timezone, then locale.
// Falls back to the default region (United States) when nothing matches.
export const detectRegionCode = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Australia/')) return 'AU';
    if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];

    const locales = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    for (const locale of locales) {
      const lower = locale.toLowerCase();
      if (LOCALE_TO_COUNTRY[lower]) return LOCALE_TO_COUNTRY[lower];
      const region = lower.split('-')[1];
      if (region && REGIONS[region.toUpperCase()]) return region.toUpperCase();
    }
  } catch {
    /* ignore detection errors and fall through to the default */
  }
  return DEFAULT_REGION.code;
};

// Best-effort friendly place name derived from the visitor's timezone
// (e.g. "Australia/Melbourne" -> "Melbourne"). Used to pre-fill the city field.
export const detectCityFromTimezone = (): string => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const part = tz.split('/').pop() || '';
    return part.replace(/_/g, ' ');
  } catch {
    return '';
  }
};
