import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Offer } from '@/types';
import { Tag, DollarSign, Clock, Zap, Lock, Crown, Star, Heart, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { useRegion } from '@/contexts/RegionContext';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const { formatCurrency } = useRegion();
  const validToDate = new Date(offer.validTo);
  const isValid = new Date() < validToDate;
  const isFree = offer.creditCost === 0;
  // Rough indication of the deal's worth, shown in the offer's own currency.
  const estimatedValue = offer.creditCost > 0 ? offer.creditCost * 2 : 10;
  
  // Logic for "Local Hero" / Favorite
  const isLocalHero = (offer.business?.avgStarRating || 0) >= 4.5;

  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group h-full border-t-4 border-t-transparent hover:border-t-primary">
      <Link to={`/offers/${offer.id}`} className="block relative overflow-hidden">
        <div className="relative h-48 w-full">
          <img
            src={offer.imageUrl || '/placeholder.svg'}
            alt={offer.title}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${offer.isPremium ? 'brightness-90' : ''}`}
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {offer.isPremium && (
                <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md border border-yellow-400 flex items-center w-fit">
                <Crown className="w-3 h-3 mr-1 fill-white" /> CLUB EXCLUSIVE
                </span>
            )}
            {isLocalHero && (
                <span className="bg-white/90 dark:bg-gray-900/90 text-orange-600 text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center w-fit backdrop-blur-sm">
                    <Heart className="w-3 h-3 mr-1 fill-orange-500 text-orange-500" /> LOCAL FAVE
                </span>
            )}
          </div>

          {offer.isPremium && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="bg-yellow-500 text-white font-bold px-4 py-2 rounded-full flex items-center shadow-lg transform scale-110">
                    <Lock className="w-4 h-4 mr-2" /> Unlock
                </span>
            </div>
          )}

          {!offer.isPremium && isFree ? (
             <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                <Zap className="w-3 h-3 mr-1 fill-white" /> FREE Unlock
             </span>
          ) : (
            !offer.isPremium && (
             <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {offer.creditCost} Credits
             </span>
            )
          )}
        </div>
      </Link>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold truncate leading-tight">
          <Link to={`/offers/${offer.id}`} className="hover:text-primary transition-colors">
            {offer.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-between">
           <span>{offer.business?.tradingName || 'Local Business'} • {offer.business?.city || 'City'}</span>
           {offer.business?.avgStarRating && (
               <span className="flex items-center text-orange-500 font-semibold bg-orange-50 px-1.5 rounded">
                   {offer.business.avgStarRating} <Star className="w-3 h-3 ml-0.5 fill-current" />
               </span>
           )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-grow pt-0">
        <p className="line-clamp-2 text-sm">{offer.shortDescription}</p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
          <span className="flex items-center">
            <Clock className="mr-1.5 h-3.5 w-3.5" />
            Expires {format(validToDate, 'MMM d')}
          </span>
          <span className="flex items-center font-medium text-green-700 dark:text-green-500">
            <Gift className="mr-1 h-3.5 w-3.5" />
            Worth ~{formatCurrency(estimatedValue, offer.currency)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Link to={`/offers/${offer.id}`} className="w-full">
          <Button className="w-full h-9 text-sm" variant={offer.isPremium ? "secondary" : (isFree ? "default" : "outline")}>
             {offer.isPremium ? (
                 <span className="flex items-center text-yellow-700 dark:text-yellow-500 font-semibold">
                     <Lock className="w-3.5 h-3.5 mr-2" /> Members Only
                 </span>
             ) : (
                 isFree ? "View Free Deal" : "View Details"
             )}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default OfferCard;