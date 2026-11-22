import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Store, MapPin, Globe, Phone, Mail, UserCheck, Clock, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { REGIONS } from '@/config/regions';
import { useRegion } from '@/contexts/RegionContext';

const CreateBusiness = () => {
  const navigate = useNavigate();
  const { region, city: regionCity, setCity } = useRegion();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [formData, setFormData] = useState({
    legalName: '',
    tradingName: '',
    description: '',
    address: '',
    city: regionCity || '',
    country: region.code === 'OTHER' ? '' : region.code,
    phone: '',
    email: '',
    website: '',
    logoUrl: '',
    coverImageUrl: '',
    categoryTags: '',
    openingHours: 'Mon-Fri: 9am - 5pm\nSat-Sun: Closed' // Default value
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Fill the city from the visitor's device location (timezone-derived place name).
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        const detected = regionCity || '';
        setFormData(prev => ({ ...prev, city: detected }));
        setCity(detected);
        toast.success(detected ? `Located: ${detected}` : 'Location detected.');
        setGeoLoading(false);
      },
      () => {
        toast.error('Unable to retrieve your location.');
        setGeoLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Concatenate opening hours into description for now as schema support is limited in MVP
    const fullDescription = `${formData.description}\n\nOPENING HOURS:\n${formData.openingHours}`;

    const selectedRegion = REGIONS[formData.country];

    const payload = {
        ...formData,
        // Store the connection's country/currency/timezone alongside the free-text city.
        currency: selectedRegion?.currency || 'USD',
        timezone: selectedRegion?.timezone || 'UTC',
        description: fullDescription,
        categoryTags: formData.categoryTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    };

    try {
      await api.post('/businesses', payload);
      toast.success('Business registered successfully! Welcome to the club.');
      navigate('/business/dashboard');
    } catch (error: any) {
      console.error('Failed to create business:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register business.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center py-10">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Store className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Register Your Business</CardTitle>
          <CardDescription className="text-lg">
            Join the club. Start your 30-day free trial and connect with high-intent customers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tradingName">Trading Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="tradingName"
                    name="tradingName"
                    placeholder="e.g. Joe's Coffee House"
                    value={formData.tradingName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Legal Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="legalName"
                    name="legalName"
                    placeholder="e.g. Joseph Enterprises LLC"
                    value={formData.legalName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">About Your Business</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell customers what makes you special..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="openingHours" className="flex items-center gap-2">
                     <Clock className="h-4 w-4" /> Opening Hours
                  </Label>
                  <Textarea
                    id="openingHours"
                    name="openingHours"
                    placeholder="e.g. Mon-Fri: 9am - 5pm"
                    value={formData.openingHours}
                    onChange={handleChange}
                    rows={3}
                    className="font-mono text-sm"
                  />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="categoryTags">Categories (comma separated)</Label>
                  <Input
                    id="categoryTags"
                    name="categoryTags"
                    placeholder="e.g. Food, Cafe, Breakfast, Local"
                    value={formData.categoryTags}
                    onChange={handleChange}
                  />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5" /> Location
              </h3>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address <span className="text-red-500">*</span></Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      id="city"
                      name="city"
                      placeholder="e.g. New York"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseLocation}
                      disabled={geoLoading}
                      title="Use my location"
                    >
                      {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">Use my location</span>
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, country: value }));
                      toast.success(`Selected: ${REGIONS[value]?.name || value}`);
                    }}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(REGIONS).map((r) => (
                        <SelectItem key={r.code} value={r.code}>
                          {r.flag} {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <Globe className="h-5 w-5" /> Contact Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        className="pl-9"
                        placeholder="contact@business.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                   <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="phone"
                        name="phone"
                        className="pl-9"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Branding */}
             <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Branding (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    placeholder="https://..."
                    value={formData.logoUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverImageUrl">Cover Image URL</Label>
                  <Input
                    id="coverImageUrl"
                    name="coverImageUrl"
                    placeholder="https://..."
                    value={formData.coverImageUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Business Profile...
                </>
              ) : (
                'Launch Business Profile'
              )}
            </Button>
            <p className="text-xs text-center text-gray-500">
                By clicking "Launch", you agree to our Partner Terms of Service.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateBusiness;