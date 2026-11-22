import React, { createContext, useContext, useState, ReactNode } from 'react';
import { REGIONS, Region, DEFAULT_REGION, detectRegionCode, detectCityFromTimezone } from '@/config/regions';

interface RegionContextType {
  region: Region;
  countryCode: string;
  city: string;
  setRegionCode: (code: string) => void;
  setCity: (city: string) => void;
  formatCurrency: (amount: number, currency?: string) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const STORAGE_KEY_REGION = 'dealpass_region';
const STORAGE_KEY_CITY = 'dealpass_city';

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  // Use the stored country if present, otherwise detect from the browser
  // locale/timezone, falling back to the default region (United States).
  const [region, setRegion] = useState<Region>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_REGION);
    if (stored && REGIONS[stored]) return REGIONS[stored];
    const detected = detectRegionCode();
    return REGIONS[detected] || DEFAULT_REGION;
  });

  // City is free text. Default to the visitor's timezone-derived place name.
  const [city, setCityState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_CITY) || detectCityFromTimezone();
  });

  const setRegionCode = (code: string) => {
    if (REGIONS[code]) {
      setRegion(REGIONS[code]);
      localStorage.setItem(STORAGE_KEY_REGION, code);
    }
  };

  const setCity = (nextCity: string) => {
    const trimmed = nextCity.trim();
    setCityState(trimmed);
    localStorage.setItem(STORAGE_KEY_CITY, trimmed);
  };

  // Formats an amount in the given currency, or the selected region's currency.
  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || region.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <RegionContext.Provider
      value={{ region, countryCode: region.code, city, setRegionCode, setCity, formatCurrency }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
