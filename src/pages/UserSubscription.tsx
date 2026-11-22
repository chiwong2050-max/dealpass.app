import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star, ShieldCheck, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const UserSubscription = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await api.post('/auth/upgrade');
      await loadUser(); // Refresh user data
      toast.success('Successfully upgraded to Premium Member!');
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      toast.error('Failed to upgrade subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isPremium = user?.userTier === 'PREMIUM';

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Join the Club</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Members save an average of <span className="font-bold text-green-600">$450/year</span>.
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-8">
        <Label className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'text-gray-500'}`}>Monthly</Label>
        <Switch 
            checked={billingCycle === 'yearly'}
            onCheckedChange={(c) => setBillingCycle(c ? 'yearly' : 'monthly')}
        />
        <Label className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : 'text-gray-500'}`}>
            Yearly <span className="text-xs text-green-600 font-normal">(Best Value)</span>
        </Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Free Plan */}
        <Card className={`border-2 flex flex-col ${!isPremium ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
          <CardHeader>
            <CardTitle className="text-2xl">Trial Guest</CardTitle>
            <CardDescription>Try a few deals on us.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="text-4xl font-bold">$0</div>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Check className="mr-2 h-5 w-5 text-green-500" /> Unlock <span className="font-bold ml-1">2 coupons</span> total
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <Check className="mr-2 h-5 w-5 text-green-500" /> Access to standard offers
              </li>
              <li className="flex items-center text-gray-400">
                <X className="mr-2 h-5 w-5" /> No premium exclusives
              </li>
            </ul>
          </CardContent>
          <CardFooter>
             <Button className="w-full" variant="outline" disabled={true}>
              {isPremium ? 'Downgrade not available' : 'Current Plan'}
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className={`border-2 flex flex-col relative overflow-hidden ${isPremium ? 'border-primary shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
             VIP ACCESS
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
                Club Member <Star className="ml-2 h-5 w-5 text-yellow-500 fill-yellow-500" />
            </CardTitle>
            <CardDescription>Unlimited savings everywhere.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="text-4xl font-bold">
                {billingCycle === 'monthly' ? '$4.99' : '$39'}
                <span className="text-xl font-normal text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            {billingCycle === 'yearly' && (
                <p className="text-xs text-green-600 font-bold -mt-2">That's only $3.25/month!</p>
            )}
            <ul className="space-y-3">
              <li className="flex items-center font-medium">
                <Check className="mr-2 h-5 w-5 text-green-500" /> <span className="font-bold ml-1">Unlimited</span> Unlocks
              </li>
              <li className="flex items-center font-medium">
                <Check className="mr-2 h-5 w-5 text-green-500" /> Access to <span className="text-yellow-600 dark:text-yellow-400 font-bold ml-1">Premium Exclusive</span> offers
              </li>
              <li className="flex items-center font-medium">
                <Check className="mr-2 h-5 w-5 text-green-500" /> Local & Global Access
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPremium ? (
              <Button className="w-full" disabled variant="secondary">
                Active Plan
              </Button>
            ) : (
              <Button className="w-full bg-gradient-to-r from-primary to-blue-700 hover:from-primary/90 hover:to-blue-700/90" onClick={handleUpgrade} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Join the Club'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

       {/* Social Proof */}
       <div className="max-w-2xl mx-auto text-center pt-8 border-t">
            <p className="italic text-gray-500">"I saved $50 on my first dinner out. The membership paid for itself immediately."</p>
            <p className="text-sm font-bold mt-2">- Sarah J., Melbourne</p>
       </div>
    </div>
  );
};

export default UserSubscription;