import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AdPlaceholderProps {
  slotId: string;
  format?: 'horizontal' | 'rectangle' | 'vertical';
  className?: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ slotId, format = 'horizontal', className = '' }) => {
  const { user } = useAuth();
  
  // Real check: If user is Premium, hide all ads.
  const isPremium = user?.userTier === 'PREMIUM';

  if (isPremium) return null;

  const dimensions = {
    horizontal: 'h-[90px] w-full max-w-[728px]',
    rectangle: 'h-[250px] w-[300px]',
    vertical: 'h-[600px] w-[160px]',
  };

  return (
    <div className={`flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-2 my-4 mx-auto text-xs text-gray-400 ${dimensions[format]} ${className}`}>
      <span className="font-semibold mb-1">GOOGLE ADSENSE (Global)</span>
      <span>Slot: {slotId}</span>
      <span className="text-[10px] mt-1 text-center">
        (Ad served to Free User • All Regions Enabled)
      </span>
    </div>
  );
};

export default AdPlaceholder;