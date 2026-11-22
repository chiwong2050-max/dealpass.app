import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowLeft, Keyboard, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import QrScanner from '@/components/QrScanner';

const ScanRedeem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualCode, setManualCode] = useState('');

  const processCode = async (code: string) => {
    if (loading || successData) return;
    
    // Parse Offer ID from URL if it's a full URL
    // Format: domain/deal/slug-ID
    let offerId = code;
    if (code.includes('/deal/') || code.includes('/offers/')) {
        try {
             const parts = code.split('-');
             offerId = parts[parts.length - 1]; 
        } catch(e) {
             // keep original code if parse fails
        }
    }

    setLoading(true);
    try {
        const res = await api.post(`/offers/${offerId}/scan`);
        setSuccessData(res.data);
        toast.success("Deal Verified!");
        // Small vibration for tactile feedback
        if (navigator.vibrate) navigator.vibrate(200);
    } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Invalid Code");
    } finally {
        setLoading(false);
    }
  };

  const handleScan = (text: string) => {
      if (text) processCode(text);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (manualCode) processCode(manualCode);
  };

  if (successData) {
      return (
          <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-sm border-4 border-green-500 shadow-xl animate-in zoom-in duration-300">
                  <CardContent className="pt-10 pb-10 text-center space-y-4">
                      <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-10 h-10 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-green-900">Verified!</h2>
                      <div className="text-gray-600">
                          <p className="font-semibold text-lg">{successData.offerTitle}</p>
                          <p>at {successData.businessName}</p>
                      </div>
                      <div className="bg-white p-4 rounded border border-dashed border-gray-300 mt-4">
                          <p className="text-sm text-gray-500">Show this screen to staff.</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/offers')}>
                          Done
                      </Button>
                  </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="p-4 flex items-center justify-between z-10">
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-6 w-6" /> Back
          </Button>
          <div className="flex gap-2">
               <Button 
                size="sm" 
                variant={mode === 'camera' ? 'secondary' : 'ghost'} 
                onClick={() => setMode('camera')}
                className="gap-2"
               >
                   <Camera className="w-4 h-4" /> Scan
               </Button>
               <Button 
                size="sm" 
                variant={mode === 'manual' ? 'secondary' : 'ghost'} 
                onClick={() => setMode('manual')}
                className="gap-2"
               >
                   <Keyboard className="w-4 h-4" /> Type
               </Button>
          </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center relative w-full max-w-md mx-auto px-4">
          
          {mode === 'camera' ? (
               <div className="w-full aspect-square bg-gray-900 relative overflow-hidden rounded-xl border-2 border-white/30 shadow-2xl">
                   <QrScanner onResult={handleScan} />
               </div>
          ) : (
               <Card className="w-full bg-gray-900 border-gray-800 text-white">
                   <CardContent className="pt-6">
                       <form onSubmit={handleManualSubmit} className="space-y-4">
                           <div className="space-y-2 text-center">
                               <h3 className="text-xl font-bold">Enter Offer ID</h3>
                               <p className="text-gray-400 text-sm">Found below the QR code on the poster.</p>
                           </div>
                           <Input 
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                                placeholder="e.g. 12345"
                                className="bg-gray-800 border-gray-700 text-center text-2xl tracking-widest h-14"
                                autoFocus
                           />
                           <Button className="w-full h-12 text-lg" disabled={!manualCode || loading}>
                               {loading ? <Loader2 className="animate-spin" /> : 'Verify'}
                           </Button>
                       </form>
                   </CardContent>
               </Card>
          )}

          {mode === 'camera' && (
             <p className="mt-6 text-gray-400 text-center text-sm">
                 Point your camera at the DealPass QR code displayed at the business.
             </p>
          )}
      </div>
    </div>
  );
};

export default ScanRedeem;