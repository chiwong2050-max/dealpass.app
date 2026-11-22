import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/services/api';
import { Offer, UnlockedOffer } from '@/types';
import { Loader2, DollarSign, Clock, Tag, MapPin, Phone, Mail, Globe, Star, Info, Lock, CalendarDays, Users, ThumbsUp, Baby, Gift, Coins, Footprints, AlertTriangle, Hourglass, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { extractIdFromSlug } from '@/utils/slugs';
import CreditExplainer from '@/components/CreditExplainer';

const OfferDetailsPage = () => {
  const { id, slugId } = useParams<{ id?: string, slugId?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [userHistory, setUserHistory] = useState<{ visitCount: number, isReturningCustomer: boolean } | null>(null);
  const [usageStats, setUsageStats] = useState<{ todaysUnlocks: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Unlock & Booking State
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedOffer, setUnlockedOffer] = useState<UnlockedOffer | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  
  // Booking Form Data
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [partySize, setPartySize] = useState('2');

  const resolvedId = id || (slugId ? extractIdFromSlug(slugId) : null);
  const trafficSource = searchParams.get('source');

  useEffect(() => {
    const fetchOffer = async () => {
      if (!resolvedId) {
        setError('Offer Not Found');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Pass source for view tracking
        const url = trafficSource ? `/offers/${resolvedId}?source=${trafficSource}` : `/offers/${resolvedId}`;
        const response = await api.get(url);
        setOffer(response.data.offer);
        if (response.data.userHistory) setUserHistory(response.data.userHistory);
        if (response.data.usageStats) setUsageStats(response.data.usageStats);
      } catch (err: any) {
        console.error('Failed to fetch offer details:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load offer details.';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [resolvedId, trafficSource]);

  const initiateUnlock = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to unlock this offer.');
      navigate('/login');
      return;
    }
    
    // Check if booking required
    const requiresBooking = offer?.eligibilityDetails?.requiresBooking;
    
    if (requiresBooking) {
        setShowBookingDialog(true);
    } else {
        handleUnlockOffer();
    }
  };

  const handleUnlockOffer = async () => {
    if (!resolvedId) return;
    setUnlocking(true);
    setShowBookingDialog(false); // Close booking dialog if open

    try {
      const payload: any = { source: trafficSource || 'in_app' }; // Pass the source!
      
      // If booking data exists, include it
      if (offer?.eligibilityDetails?.requiresBooking) {
          if (!bookingDate || !bookingTime || !partySize) {
              toast.error("Please fill in all booking details.");
              setUnlocking(false);
              return;
          }
          payload.bookingDetails = {
              date: bookingDate,
              time: bookingTime,
              partySize: partySize
          };
      }

      const response = await api.post(`/offers/${resolvedId}/unlock`, payload);
      setUnlockedOffer(response.data.unlockedOffer);
      toast.success('Offer unlocked successfully!');
      setShowQrDialog(true); 
    } catch (err: any) {
      console.error('Failed to unlock offer:', err);
      // Handle Race Conditions Gracefully
      const errorMessage = err.response?.data?.message || 'Failed to unlock offer.';
      
      if (errorMessage.includes('limit') || errorMessage.includes('sold out')) {
          toast.error("Sorry, this deal has just reached its limit and is no longer available. Please choose another offer.", {
              duration: 5000,
              icon: <AlertTriangle className="h-5 w-5 text-red-500" />
          });
          // Refresh data to show correct state
          window.location.reload(); 
      } else {
          setError(errorMessage);
          toast.error(errorMessage);
      }
    } finally {
      setUnlocking(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-xl text-gray-600 dark:text-gray-400">Loading offer details...</p>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <h2 className="text-2xl font-bold mb-2">Offer Not Found</h2>
          <Button onClick={() => navigate('/offers')} className="mt-4">Back to Offers</Button>
        </div>
      </div>
    );
  }

  const validToDate = new Date(offer.validTo);
  const isValid = new Date() < validToDate;
  const isUserPremium = user?.userTier === 'PREMIUM';
  const canUnlock = !offer.isPremium || isUserPremium;
  const hasEnoughCredits = user && user.creditBalance >= offer.creditCost;
  
  // Calculate availability states
  const isTotalSoldOut = offer.totalLimit !== null && offer.totalLimit !== undefined && offer.unlockCount >= offer.totalLimit;
  const todaysUnlocks = usageStats?.todaysUnlocks || 0;
  const isDailySoldOut = offer.dailyLimit !== null && offer.dailyLimit !== undefined && todaysUnlocks >= offer.dailyLimit;
  
  // Availability Message
  let availabilityMessage = null;
  if (isTotalSoldOut) {
      availabilityMessage = (
          <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded text-center">
              <p className="font-bold flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> OFFER ENDED
              </p>
              <p className="text-sm mt-1">This offer has reached its maximum number of redemptions and is no longer available.</p>
          </div>
      );
  } else if (isDailySoldOut) {
      availabilityMessage = (
          <div className="w-full bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded text-center">
              <p className="font-bold flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5" /> DAILY LIMIT REACHED
              </p>
              <p className="text-sm mt-1">0 left today • Resets tomorrow at 00:00</p>
          </div>
      );
  } else {
      // Available - Show Scarcity
      if (offer.dailyLimit) {
          const leftToday = offer.dailyLimit - todaysUnlocks;
          availabilityMessage = (
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                  <Hourglass className="w-4 h-4" /> Available – {leftToday} left today
              </div>
          );
      } else if (offer.totalLimit) {
          const leftTotal = offer.totalLimit - offer.unlockCount;
          availabilityMessage = (
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                  <Hourglass className="w-4 h-4" /> Hurry! Only {leftTotal} left.
              </div>
          );
      } else {
          availabilityMessage = (
              <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full text-sm font-medium border border-green-200">
                  <CheckCircle2 className="w-4 h-4" /> Limited offer – still available today
              </div>
          );
      }
  }

  // Parse time details
  const timeDetails = offer.timeDetails || {};
  const hasTimeRestrictions = timeDetails.startTime || timeDetails.days?.length > 0;
  
  // Tag Logic
  const categories = offer.business?.categoryTags || [];
  const isFamilyFriendly = categories.some(c => ['kids', 'family', 'fun', 'park'].includes(c.toLowerCase()));
  const estimatedValue = offer.creditCost > 0 ? offer.creditCost * 2 : 10; 

  // Mock Reviews
  const reviews = [
      { user: "Sarah J.", rating: 5, comment: "Amazing deal! The staff were so lovely.", date: "2 days ago" },
      { user: "Mike T.", rating: 4, comment: "Easy to redeem. Food was great.", date: "1 week ago" }
  ];

  // Map Link
  const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${offer.business?.address}, ${offer.business?.city}`)}`;

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="relative p-0">
          <img
            src={offer.imageUrl || '/placeholder.svg'}
            alt={offer.title}
            className={`w-full h-64 object-cover rounded-t-lg ${!canUnlock && isAuthenticated ? 'grayscale' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex items-end">
            <div className="text-white w-full">
               <div className="flex gap-2 mb-2">
                 {isFamilyFriendly && <Badge variant="secondary" className="bg-green-500/80 text-white"><Baby className="w-3 h-3 mr-1"/> Family Friendly</Badge>}
                 {offer.isPremium && <Badge variant="secondary" className="bg-yellow-500/80 text-white"><Lock className="w-3 h-3 mr-1"/> Members Only</Badge>}
                 {isTotalSoldOut && <Badge variant="destructive" className="bg-red-600 text-white">SOLD OUT</Badge>}
               </div>
              <CardTitle className="text-4xl font-extrabold flex items-center gap-2">
                {offer.title}
              </CardTitle>
              <CardDescription className="text-xl mt-2 text-gray-200">{offer.shortDescription}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* USER HISTORY BANNER */}
          {userHistory && userHistory.visitCount > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                      <Footprints className="h-5 w-5" />
                  </div>
                  <div>
                      <p className="font-bold text-blue-900 dark:text-blue-100">Welcome back!</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                          You've visited {offer.business?.tradingName} <strong>{userHistory.visitCount} times</strong> using DealPass.
                      </p>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
            <div className="flex items-center">
              <DollarSign className="mr-3 h-6 w-6 text-primary" />
              <span>Unlock Cost: <span className="font-semibold">{offer.creditCost} Credits</span></span>
              {/* Added CreditExplainer Here */}
              <div className="ml-2">
                 <CreditExplainer>
                    <Info className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary" />
                 </CreditExplainer>
              </div>
            </div>
            <div className="flex items-center text-green-700 font-medium">
              <Gift className="mr-3 h-6 w-6" />
              <span>Est. Value: ~${estimatedValue}</span>
            </div>
            
            {hasTimeRestrictions && (
                 <div className="flex items-start col-span-1 md:col-span-2 bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                    <Clock className="mr-3 h-5 w-5 text-yellow-600 mt-1" />
                    <div className="text-sm">
                        <span className="font-bold text-yellow-800 dark:text-yellow-200 block mb-1">Valid Hours Only:</span>
                        {timeDetails.days && timeDetails.days.length > 0 && (
                            <div className="mb-1">{timeDetails.days.join(', ')}</div>
                        )}
                        {timeDetails.startTime && (
                            <div>{timeDetails.startTime} - {timeDetails.endTime}</div>
                        )}
                    </div>
                </div>
            )}
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            <AlertTitle className="text-blue-800 dark:text-blue-200">How it works</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              1. Unlock the offer here.<br/>
              2. Show the QR code at the venue.<br/>
              3. Pay the business directly (they apply the discount).
            </AlertDescription>
          </Alert>

          <Separator />

          <div>
            <h3 className="text-2xl font-bold mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{offer.longDescription || offer.shortDescription}</p>
          </div>

          {offer.business && (
            <>
              <Separator />
              <div>
                <h3 className="text-2xl font-bold mb-3">About {offer.business.tradingName}</h3>
                <div className="flex items-center mb-4 text-yellow-500">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="ml-1 font-bold text-black dark:text-white">{offer.business.avgStarRating || 'New'}</span>
                    <span className="ml-2 text-sm text-gray-500">({offer.business.totalReviews || 0} reviews)</span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{offer.business.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
                    <a href={mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {offer.business.address}, {offer.business.city} (Open Map)
                    </a>
                  </div>
                  {offer.business.website && (
                    <div className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-muted-foreground" />
                      <a href={offer.business.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          <Separator />
          
          {/* Reviews Section */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
            {offer.business?.totalReviews === 0 ? (
                <p className="text-gray-500 italic">No reviews yet. Be the first to visit!</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold">{review.user}</span>
                                <div className="flex text-yellow-400">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{review.comment}</p>
                            <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col items-center mt-6 space-y-3">
            {/* Show Availability Status */}
            {availabilityMessage}

            {isAuthenticated ? (
              canUnlock ? (
                isTotalSoldOut || isDailySoldOut ? (
                    <Button disabled className="w-full md:w-auto px-10 py-6 text-xl h-auto opacity-50 cursor-not-allowed">
                        {isTotalSoldOut ? 'Offer Finished' : 'Daily Limit Reached'}
                    </Button>
                ) : hasEnoughCredits ? (
                    <Button 
                        onClick={initiateUnlock} 
                        disabled={!isValid || unlocking} 
                        className="w-full md:w-auto px-10 py-6 text-xl h-auto"
                    >
                    {unlocking ? (
                        <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                        </>
                    ) : (
                        offer.eligibilityDetails?.requiresBooking 
                            ? `Book Table & Unlock (${offer.creditCost} Credits)`
                            : `Unlock Offer (${offer.creditCost} Credits)`
                    )}
                    </Button>
                ) : (
                    <div className="text-center space-y-3 p-4 bg-red-50 rounded-lg border border-red-100 w-full max-w-md">
                        <p className="text-red-600 font-medium">
                            You need {offer.creditCost} credits (You have {user?.creditBalance}).
                        </p>
                        <Button 
                            onClick={() => navigate('/earn-credits')} 
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            <Coins className="mr-2 h-4 w-4" /> Earn More Credits for Free
                        </Button>
                    </div>
                )
              ) : (
                <div className="text-center w-full bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Lock className="h-12 w-12 mx-auto text-yellow-500 mb-2" />
                  <h3 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">Premium Offer</h3>
                  <Button onClick={() => navigate('/user/subscription')} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    Upgrade to Premium to Unlock
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center gap-3">
                  <Button onClick={() => navigate('/login')} className="w-full md:w-auto px-8 py-3 text-lg">
                    Login to Unlock
                  </Button>
                  <p className="text-sm text-muted-foreground">New here? Sign up to get 50 Free Credits.</p>
              </div>
            )}
          </div>
          
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Make a Reservation</DialogTitle>
                <DialogDescription>
                    This offer requires a booking. The business will receive these details.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Party Size</Label>
                    <Input type="number" min="1" max="20" value={partySize} onChange={(e) => setPartySize(e.target.value)} />
                </div>
                {timeDetails.startTime && (
                    <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                        Note: This offer is only valid between {timeDetails.startTime} and {timeDetails.endTime}.
                    </p>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>Cancel</Button>
                <Button onClick={handleUnlockOffer} disabled={unlocking}>
                   {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Booking & Unlock'}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl text-green-600 flex justify-center items-center gap-2">
                <CheckCircle2 className="w-8 h-8" /> Success!
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-base">
              You have unlocked this offer.
            </DialogDescription>
          </DialogHeader>
          
          {unlockedOffer?.qrCodeData ? (
            <div className="flex flex-col items-center space-y-4 py-2">
              <img src={unlockedOffer.qrCodeData} alt="QR Code" className="w-64 h-64 border p-2 rounded-lg" />
              
              <div className="text-center space-y-1">
                  <p className="text-sm text-muted-foreground">Coupon Code: <span className="font-mono font-semibold text-black dark:text-white">{unlockedOffer.uniqueCouponCode}</span></p>
              </div>

              {/* NEW VALIDITY SECTION */}
              <div className="text-center text-sm w-full border-t border-b py-2 my-1 border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 mr-2">Valid:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {offer && new Date(offer.validFrom).toLocaleDateString()} – {offer && new Date(offer.validTo).toLocaleDateString()}
                  </span>
              </div>

              {/* NEW DISCLAIMER SECTION */}
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md w-full text-xs text-left text-gray-600 dark:text-gray-300 space-y-1.5 border border-gray-100 dark:border-gray-700">
                    <p>• Valid for one use per customer.</p>
                    {offer?.totalLimit && (
                    <p>• Limited to the first {offer.totalLimit} redemptions overall.</p>
                    )}
                    <p className="italic text-gray-500 pt-1 mt-1">
                    "DealPass tracks availability in real time – if the offer is finished, it will show as unavailable in the app."
                    </p>
              </div>

              {offer?.eligibilityDetails?.requiresBooking && (
                <div className="w-full bg-green-50 border border-green-100 p-3 rounded-lg text-center">
                    <p className="text-sm font-semibold text-green-800">Booking Confirmed</p>
                    <p className="text-xs text-green-700">The business has been notified of your reservation.</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-red-500">Failed to generate QR code.</p>
          )}
          <Button onClick={() => { setShowQrDialog(false); navigate('/my-coupons'); }}>Done</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferDetailsPage;