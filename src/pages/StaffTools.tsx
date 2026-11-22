import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, XCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';
import QrScanner from '@/components/QrScanner';

const StaffTools = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');

  const handleScan = (text: string) => {
      if (text && !loading && !scanResult) {
        try {
            // Try parse JSON if it's our standard format
            const parsed = JSON.parse(text);
            if (parsed.couponCode) {
                verifyCoupon(parsed.couponCode);
                return;
            }
        } catch(e) {
            // Not JSON, treat as raw code
            verifyCoupon(text);
        }
      }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(manualCode) verifyCoupon(manualCode);
  };

  const verifyCoupon = async (code: string) => {
      setLoading(true);
      try {
          // Verify & Redeem in one go
          const res = await api.post(`/offers/redeem/${code}`);
          setScanResult({
              status: 'success',
              data: res.data.redeemedOffer
          });
          toast.success("Coupon Verified & Redeemed!");
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      } catch (err: any) {
          setScanResult({
              status: 'error',
              message: err.response?.data?.message || "Invalid or Expired Coupon"
          });
          toast.error("Verification Failed");
          if (navigator.vibrate) navigator.vibrate(500);
      } finally {
          setLoading(false);
      }
  };

  const resetScanner = () => {
      setScanResult(null);
      setManualCode('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center py-4">
            <div>
                <h1 className="text-2xl font-bold">Staff Mode</h1>
                <p className="text-gray-400 text-sm">Coupon Verification</p>
            </div>
            <Button variant="ghost" className="text-gray-400 hover:text-white" onClick={() => navigate('/')}>
                <LogOut className="h-5 w-5" />
            </Button>
        </div>

        {/* Scanner / Result Area */}
        <Card className="bg-gray-800 border-gray-700 overflow-hidden">
            <CardContent className="p-0">
                {scanResult ? (
                    <div className="p-8 text-center space-y-6">
                        {scanResult.status === 'success' ? (
                            <>
                                <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-green-400">Valid Coupon!</h2>
                                    <p className="text-gray-300 mt-2 text-lg">"{scanResult.data?.offer?.title}"</p>
                                    <p className="text-gray-500 text-sm mt-1">Customer: {scanResult.data?.user?.name || 'Guest'}</p>
                                </div>
                                <div className="bg-black/30 p-4 rounded-lg">
                                    <p className="text-sm font-mono text-gray-400">{scanResult.data?.uniqueCouponCode}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <XCircle className="w-12 h-12 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-red-400">Declined</h2>
                                    <p className="text-gray-300 mt-2">{scanResult.message}</p>
                                </div>
                            </>
                        )}
                        <Button size="lg" className="w-full" onClick={resetScanner}>
                            Scan Next
                        </Button>
                    </div>
                ) : (
                    <>
                        {activeTab === 'scan' ? (
                            <div className="relative aspect-square bg-black">
                                <QrScanner onResult={handleScan} />
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none z-10">
                                    <p className="text-sm bg-black/50 inline-block px-3 py-1 rounded-full backdrop-blur-md">
                                        Point at customer's screen
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 py-20 flex flex-col justify-center h-[350px]">
                                <form onSubmit={handleManualSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Enter Code Manually</label>
                                        <Input 
                                            value={manualCode}
                                            onChange={(e) => setManualCode(e.target.value)}
                                            placeholder="e.g. ABC-123"
                                            className="bg-gray-900 border-gray-600 text-lg h-12 text-center font-mono tracking-wider"
                                            autoFocus
                                        />
                                    </div>
                                    <Button size="lg" className="w-full h-12" disabled={loading || !manualCode}>
                                        {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
                                    </Button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>

        {/* Toggle Mode */}
        {!scanResult && (
            <div className="grid grid-cols-2 gap-2 bg-gray-800 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('scan')}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'scan' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Camera Scan
                </button>
                <button 
                    onClick={() => setActiveTab('manual')}
                    className={`py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'manual' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                >
                    Manual Entry
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default StaffTools;