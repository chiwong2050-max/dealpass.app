import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Share2, Facebook, Twitter, MessageCircle, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

const EarnCredits = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const referralLink = `${window.location.origin}/signup?ref=${user?.referralCode || 'USER'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const handleShareReward = async (platform: string) => {
    // In a real app, this would be a callback from the social SDK
    // Here we simulate the reward after a short delay
    setLoading(true);
    try {
        // Open share window (mock)
        const text = encodeURIComponent("Check out DealPass for amazing local discounts! Use my code " + user?.referralCode);
        let url = "";
        
        if (platform === 'WhatsApp') url = `https://wa.me/?text=${text}%20${referralLink}`;
        else if (platform === 'Facebook') url = `https://www.facebook.com/sharer/sharer.php?u=${referralLink}`;
        else if (platform === 'Twitter') url = `https://twitter.com/intent/tweet?text=${text}&url=${referralLink}`;

        window.open(url, '_blank', 'width=600,height=400');

        // Simulate tracking delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const res = await api.post('/auth/reward-share', { platform });
        toast.success(res.data.message);
        await loadUser();

    } catch (error: any) {
        toast.error('Share reward failed or you already claimed this today.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Earn Free Credits</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Current Balance: <span className="font-bold text-primary">{user?.creditBalance} Credits</span>
        </p>
        <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
            You don't need to pay money. Help us grow the community and we'll fill your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Referral Card */}
        <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-6 w-6 text-primary" /> Invite Friends
                </CardTitle>
                <CardDescription>Get 50 Credits for every friend who joins.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg flex items-center justify-between">
                    <code className="text-lg font-bold text-gray-700">{user?.referralCode}</code>
                    <Button size="sm" variant="ghost" onClick={copyLink}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <div className="text-sm text-gray-500">
                    <p>1. Send them your link.</p>
                    <p>2. They sign up (and get +25 credits).</p>
                    <p>3. You automatically get +50 credits.</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={copyLink} variant="outline">Copy Link</Button>
            </CardFooter>
        </Card>

        {/* Social Share Card */}
        <Card className="border-2 border-green-500/20 shadow-lg">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-6 w-6 text-yellow-500" /> Daily Share Bonus
                </CardTitle>
                <CardDescription>Earn 10 Credits instantly for sharing daily.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-12 bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={() => handleShareReward('WhatsApp')}
                    disabled={loading}
                >
                    <MessageCircle className="mr-3 h-5 w-5 text-green-600" /> Share on WhatsApp (+10)
                </Button>
                <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-12 bg-blue-50 hover:bg-blue-100 border-blue-200"
                    onClick={() => handleShareReward('Facebook')}
                    disabled={loading}
                >
                    <Facebook className="mr-3 h-5 w-5 text-blue-600" /> Share on Facebook (+10)
                </Button>
                 <Button 
                    variant="outline" 
                    className="w-full justify-start text-left h-12 bg-sky-50 hover:bg-sky-100 border-sky-200"
                    onClick={() => handleShareReward('Twitter')}
                    disabled={loading}
                >
                    <Twitter className="mr-3 h-5 w-5 text-sky-500" /> Tweet DealPass (+10)
                </Button>
            </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
          <h3 className="text-lg font-bold mb-4">Why Credits?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-4 bg-white rounded shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">Fair Exchange</p>
                  <p className="text-xs text-gray-500">You promote us, we give you deals.</p>
              </div>
              <div className="p-4 bg-white rounded shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">No Cash Needed</p>
                  <p className="text-xs text-gray-500">Keep your money for the actual purchase.</p>
              </div>
              <div className="p-4 bg-white rounded shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-semibold">Unlock Premium</p>
                  <p className="text-xs text-gray-500">Save up credits to buy monthly passes.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default EarnCredits;