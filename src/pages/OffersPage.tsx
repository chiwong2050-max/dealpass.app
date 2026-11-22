import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { Offer } from '@/types';
import OfferCard from '@/components/OfferCard';
import { Loader2, Search, SlidersHorizontal, Utensils, Sparkles, Wrench, Palmtree, Dumbbell, Ticket, MapPin, Navigation, ArrowDownUp, CalendarCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchParams, Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useRegion } from '@/contexts/RegionContext';
import { detectCityFromTimezone } from '@/config/regions';

const OffersPage = () => {
  const { user } = useAuth();
  const { countryCode, city } = useRegion();
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || '';
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState(initialCity || city || '');
  const [geoLoading, setGeoLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // New Filter
  const [validToday, setValidToday] = useState(false);

  const categories = [
      { id: 'All', label: 'All Deals', icon: null },
      { id: 'Food', label: 'Dining', icon: <Utensils className="w-4 h-4 mr-1" /> },
      { id: 'Spa', label: 'Beauty & Spa', icon: <Sparkles className="w-4 h-4 mr-1" /> },
      { id: 'Services', label: 'Services', icon: <Wrench className="w-4 h-4 mr-1" /> },
      { id: 'Travel', label: 'Travel', icon: <Palmtree className="w-4 h-4 mr-1" /> },
      { id: 'Fitness', label: 'Fitness', icon: <Dumbbell className="w-4 h-4 mr-1" /> },
      { id: 'Fun', label: 'Fun', icon: <Ticket className="w-4 h-4 mr-1" /> },
  ];

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/offers';
      const params = new URLSearchParams();
      
      const currentLoc = locationTerm;
      const currentSort = sortBy;

      if (activeCategory && activeCategory !== 'All') {
          const tagMap: any = {
              'Food': 'Food',
              'Spa': 'Spa',
              'Services': 'Service',
              'Travel': 'Travel',
              'Fitness': 'Fitness',
              'Fun': 'Fun'
          };
          params.append('category', tagMap[activeCategory] || activeCategory);
      }
      
      if (searchTerm) params.append('keyword', searchTerm);
      if (currentLoc) params.append('city', currentLoc);
      // Restrict results to the visitor's selected country.
      if (countryCode && countryCode !== 'OTHER') params.append('country', countryCode);
      if (currentSort) params.append('sort', currentSort);
      
      // Calculate current day short name (Mon, Tue, etc.)
      if (validToday) {
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const today = days[new Date().getDay()];
          params.append('day', today);
      }

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await api.get(url);
      setOffers(response.data.offers);
    } catch (err: any) {
      console.error('Failed to fetch offers:', err);
      if (err.response?.status !== 404) {
         const errorMessage = err.response?.data?.message || 'Failed to load offers.';
         setError(errorMessage);
         toast.error(errorMessage);
      } else {
         setOffers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCity && user?.city && !locationTerm) {
        setLocationTerm(user.city);
    }
  }, [user]);

  useEffect(() => {
      fetchOffers();
  }, [activeCategory, sortBy, validToday, countryCode]); // Re-fetch when these change

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      fetchOffers();
  };

  const clearFilters = () => {
      setActiveCategory('All'); 
      setSearchTerm(''); 
      setLocationTerm('');
      setSortBy('newest');
      setValidToday(false);
      window.location.href = '/offers'; 
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) {
        toast.error("Geolocation is not supported");
        return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                // Use the visitor's selected city, falling back to the
                // timezone-derived place name when none is set.
                const detectedCity = city || detectCityFromTimezone();
                setLocationTerm(detectedCity);
                toast.success(`Located: ${detectedCity}`);
                // Will trigger fetch via locationTerm effect if I had one, but manual trigger here is safer
                setTimeout(() => document.getElementById('search-btn')?.click(), 100);
            } catch (err) {
                toast.error("Failed to get location");
            } finally {
                setGeoLoading(false);
            }
        },
        (error) => {
            setGeoLoading(false);
            toast.error("Unable to retrieve location");
        }
    );
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Explore Deals</h1>
            <p className="text-sm text-gray-500">Discover local secrets in your city.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row w-full lg:w-auto gap-2 items-center">
            <div className="relative w-full sm:w-48">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search keywords..." 
                    className="pl-9 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="relative w-full sm:w-40 flex gap-1">
                <div className="relative flex-grow">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="City" 
                        className="pl-9 bg-white"
                        value={locationTerm}
                        onChange={(e) => setLocationTerm(e.target.value)}
                    />
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="flex-shrink-0" 
                    onClick={handleNearMe}
                    disabled={geoLoading}
                >
                   {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4 text-blue-600" />}
                </Button>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-36 bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" id="search-btn" className="w-full sm:w-auto">Search</Button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-grow w-full">
              {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`
                        flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${activeCategory === cat.id 
                            ? 'bg-primary text-white shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 border'}
                    `}
                  >
                      {cat.icon}
                      {cat.label}
                  </button>
              ))}
          </div>

          {/* Valid Today Toggle */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border shadow-sm flex-shrink-0">
              <Switch id="valid-today" checked={validToday} onCheckedChange={setValidToday} />
              <Label htmlFor="valid-today" className="cursor-pointer flex items-center gap-1.5 text-sm font-medium">
                  <CalendarCheck className="w-4 h-4 text-green-600" /> Valid Today
              </Label>
          </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
         <div className="text-center py-20 text-red-500">
            <p>{error}</p>
            <Button variant="link" onClick={clearFilters}>Try again</Button>
         </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 mb-4">No deals here yet - be the first business to list one</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/create-business">List your business</Link>
            </Button>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
            ))}
            </div>
        </>
      )}
    </div>
  );
};

export default OffersPage;