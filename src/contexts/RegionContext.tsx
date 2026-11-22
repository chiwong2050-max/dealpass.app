import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { REGIONS, Region, DEFAULT_REGION } from '@/config/regions';

interface RegionContextType {
  region: Region;
  setRegionCode: (code: string) => void;
  formatCurrency: (amount: number) => string;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  // Try to find a stored region or default to AU
  const [region, setRegion] = useState<Region>(() => {
    const stored = localStorage.getItem('dealpass_region');
    return stored && REGIONS[stored] ? REGIONS[stored] : DEFAULT_REGION;
  });

  const setRegionCode = (code: string) => {
    if (REGIONS[code]) {
      setRegion(REGIONS[code]);
      localStorage.setItem('dealpass_region', code);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: region.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <RegionContext.Provider value={{ region, setRegionCode, formatCurrency }}>
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