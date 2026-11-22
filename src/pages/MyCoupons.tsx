import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { UnlockedOffer } from '@/types';
import { Loader2, QrCode, ExternalLink, Calendar, History, Wallet, CheckCircle2, PiggyBank } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyCoupons = () => {
  const [coupons, setCoupons] = useState<UnlockedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<UnlockedOffer | null>(null);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const response = await api.get('/offers/my-coupons');
        setCoupons(response.data.unlockedOffers);
        
        // Calculate estimated savings (Mock logic based on credits used, real app would use discount value)
        let savings = 0;
        response.data.unlockedOffers.forEach((u: any) => {
            const cost = u.offer?.creditCost || 0;
            // Assumption: 1 credit unlocks approx $2 value, minimum $10 deal value
            savings += (cost > 0 ? cost * 2 : 10);
        });
        setTotalSavings(savings);

      } catch (err: any) {
        console.error('Failed to fetch coupons:', err);
        toast.error('Failed to load your coupons.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-xl text-gray-600 dark:text-gray-400">Loading coupons...</p>
      </div>
    );
  }

  const activeCoupons = coupons.filter(c => !c.isRedeemed);
  const redeemedCoupons = coupons.filter(c => c.isRedeemed);

  const CouponList = ({ items, isActiveList }: { items: UnlockedOffer[], isActiveList: boolean }) => {
      if (items.length === 0) {
          return (
              <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      {isActiveList ? <Wallet className="w-8 h-8" /> : <History className="w-8 h-8" />}
                  </div>
                  <p className="text-lg font-medium text-gray-900">{isActiveList ? "No active coupons" : "No redemption history"}</p>
                  <p className="text-gray-500 mb-6">{isActiveList ? "Browse deals to start saving." : "Offers you use will appear here."}</p>
                  {isActiveList && (
                      <Link to="/offers">
                        <Button>Browse Offers</Button>
                      </Link>
                  )}
              </div>
          );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((coupon) => (
            <Card key={coupon.id} className={`${coupon.isRedeemed ? 'bg-gray-50 opacity-80' : 'bg-white'} dark:bg-gray-800 shadow-md transition-all hover:shadow-lg`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate leading-tight flex-1">{coupon.offer?.title}</CardTitle>
                    {coupon.isRedeemed && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-2" />}
                </div>
                <CardDescription>{coupon.business?.tradingName}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{coupon.isRedeemed ? 'Redeemed:' : 'Expires:'}</span>
                  <span className="font-medium">
                      {coupon.isRedeemed && coupon.redeemedAt 
                        ? format(new Date(coupon.redeemedAt), 'MMM d, yyyy') 
                        : format(new Date(coupon.expiresAt), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className={`font-medium ${coupon.isRedeemed ? 'text-green-600' : 'text-blue-600'}`}>
                    {coupon.isRedeemed ? 'Redeemed' : 'Ready to use'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant={coupon.isRedeemed ? "outline" : "default"}
                  onClick={() => setSelectedCoupon(coupon)}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  {coupon.isRedeemed ? 'View Receipt' : 'Show Coupon'}
                </Button>
                
                {coupon.offer?.externalUrl && !coupon.isRedeemed && (
                   <a href={coupon.offer.externalUrl} target="_blank" rel="noopener noreferrer" className="flex-none">
                     <Button variant="outline" size="icon">
                       <ExternalLink className="h-4 w-4" />
                     </Button>
                   </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      );
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
          
          <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm border border-green-200 dark:border-green-800">
              <PiggyBank className="w-5 h-5" />
              <span className="text-sm font-medium">Total Saved:</span>
              <span className="text-lg font-bold">${totalSavings}</span>
          </div>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
              <TabsTrigger value="active" className="flex items-center gap-2"><Wallet className="w-4 h-4" /> Active ({activeCoupons.length})</TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2"><History className="w-4 h-4" /> History ({redeemedCoupons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
              <CouponList items={activeCoupons} isActiveList={true} />
          </TabsContent>

          <TabsContent value="history">
              <CouponList items={redeemedCoupons} isActiveList={false} />
          </TabsContent>
      </Tabs>

      {/* QR Code / Details Dialog */}
      <Dialog open={!!selectedCoupon} onOpenChange={(open) => !open && setSelectedCoupon(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCoupon?.offer?.title}</DialogTitle>
            <DialogDescription>
              {selectedCoupon?.business?.tradingName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCoupon && (
            <div className="flex flex-col items-center space-y-4 py-4">
              {selectedCoupon.isRedeemed ? (
                <div className="flex flex-col items-center p-6 bg-green-50 rounded-xl w-full border border-green-100">
                  <span className="text-green-600 font-bold text-xl flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" /> REDEEMED
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    on {selectedCoupon.redeemedAt && format(new Date(selectedCoupon.redeemedAt), 'MMM d, yyyy h:mm a')}
                  </span>
                  <div className="mt-4 pt-4 border-t border-green-200 w-full text-center">
                      <p className="text-xs text-green-700">Thank you for visiting!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-4 border-white shadow-sm rounded-xl overflow-hidden">
                    <img 
                      src={selectedCoupon.qrCodeData} 
                      alt="QR Code" 
                      className="w-64 h-64 object-contain bg-white" 
                    />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm text-muted-foreground">Coupon Code</p>
                    <p className="font-mono text-xl font-bold tracking-wider text-black dark:text-white">{selectedCoupon.uniqueCouponCode}</p>
                  </div>
                  
                  {/* VALIDITY DATES */}
                  <div className="text-center text-sm w-full py-2 border-t border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>Valid: {selectedCoupon.offer?.validFrom && format(new Date(selectedCoupon.offer.validFrom), 'MMM d')} – {selectedCoupon.offer?.validTo && format(new Date(selectedCoupon.offer.validTo), 'MMM d, yyyy')}</span>
                      </div>
                  </div>

                  {/* LIMIT NOTES & DISCLAIMER */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mt-2 w-full text-xs text-left text-gray-600 dark:text-gray-300 space-y-2 border border-gray-200 dark:border-gray-700">
                     <p>• Valid for one use per customer.</p>
                     {selectedCoupon.offer?.totalLimit && (
                        <p>• Limited to the first {selectedCoupon.offer.totalLimit} redemptions overall.</p>
                     )}
                     <p className="italic text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700 mt-1">
                       "DealPass tracks availability in real time – if the offer is finished, it will show as unavailable in the app."
                     </p>
                  </div>
                  
                  {selectedCoupon.offer?.externalUrl && (
                    <a href={selectedCoupon.offer.externalUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="secondary" className="w-full mt-2">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Go to Deal Website
                      </Button>
                    </a>
                  )}
                </>
              )}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setSelectedCoupon(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyCoupons;