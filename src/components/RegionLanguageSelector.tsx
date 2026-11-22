import React from 'react';
import { useRegion } from '@/contexts/RegionContext';
import { useTranslation } from 'react-i18next';
import { REGIONS } from '@/config/regions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Globe, Check, ChevronDown } from 'lucide-react';

const RegionLanguageSelector = () => {
  const { region, setRegionCode } = useRegion();
  const { i18n } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 px-4 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center gap-2"
        >
           <span className="text-xl leading-none">{region.flag}</span>
           <div className="flex flex-col items-start text-xs">
               <span className="font-bold leading-tight">{region.code}</span>
               <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{i18n.language.toUpperCase()}</span>
           </div>
           <ChevronDown className="w-3 h-3 ml-1 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Select Region</DropdownMenuLabel>
        {Object.values(REGIONS).map((r) => (
            <DropdownMenuItem key={r.code} onClick={() => setRegionCode(r.code)} className="justify-between cursor-pointer py-2">
                <span className="flex items-center gap-3">
                    <span className="text-2xl">{r.flag}</span>
                    <div className="flex flex-col">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.cities.slice(0, 2).join(', ')}...</span>
                    </div>
                </span>
                {region.code === r.code && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator className="my-2" />
        
        <DropdownMenuLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Language / 语言</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('en')} className="justify-between cursor-pointer py-2">
            <span className="flex items-center gap-2">
                🇺🇸 English
            </span>
            {i18n.language.startsWith('en') && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => i18n.changeLanguage('zh')} className="justify-between cursor-pointer py-2">
            <span className="flex items-center gap-2">
                🇨🇳 中文 (Chinese)
            </span>
            {i18n.language.startsWith('zh') && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RegionLanguageSelector;