export interface Region {
  code: string;
  name: string;
  currency: string;
  symbol: string;
  flag: string;
  cities: string[];
  timezone: string;
}

export const REGIONS: Record<string, Region> = {
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    symbol: '$',
    flag: '🇦🇺',
    cities: ['Melbourne', 'Sydney', 'Brisbane', 'Geelong', 'Gold Coast'],
    timezone: 'Australia/Melbourne'
  },
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    flag: '🇺🇸',
    cities: ['New York', 'Los Angeles', 'Chicago', 'San Francisco', 'Miami'],
    timezone: 'America/New_York'
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    flag: '🇬🇧',
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh'],
    timezone: 'Europe/London'
  },
  HK: {
    code: 'HK',
    name: 'Hong Kong',
    currency: 'HKD',
    symbol: 'HK$',
    flag: '🇭🇰',
    cities: ['Hong Kong Island', 'Kowloon', 'New Territories'],
    timezone: 'Asia/Hong_Kong'
  }
};

export const DEFAULT_REGION = REGIONS.AU;