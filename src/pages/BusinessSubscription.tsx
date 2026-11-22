import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRegion } from '@/contexts/RegionContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Handshake, Sparkles, TrendingUp, Crown, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const BusinessSubscription = () => {
  const { user } = useAuth();
  const { region, formatCurrency } = useRegion();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const isPro = user?.userTier === 'PREMIUM';

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Partner Plans</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Launch Special: First 50 partners in {region.name} join free forever (Foundation Status).
        </p>
      </div>

      {/* Payments are not connected yet - make this clear instead of faking an upgrade. */}
      <div className="max-w-2xl mx-auto mb-8 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">Paid plans coming soon</p>
          <p>The free Foundation Partner plan is active. Paid upgrades are disabled until online payments are available.</p>
        </div>
      </div>

      <div className="flex justify-center items-center gap-4 mb-8">
        <Label className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'text-gray-500'}`}>Monthly</Label>
        <Switch 
            checked={billingCycle === 'yearly'}
            onCheckedChange={(c) => setBillingCycle(c ? 'yearly' : 'monthly')}
        />
        <Label className={`text-sm ${billingCycle === 'yearly' ? 'font-bold' : 'text-gray-500'}`}>
            Yearly <span className="text-xs text-green-600 font-normal">(Save ~40%)</span>
        </Label>
      </div>

      {/* SECTION 1: PLATFORM SUBSCRIPTIONS */}
      <div className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Foundation Partner Plan */}
            <Card className={`border-2 flex flex-col relative overflow-hidden ${!isPro ? 'border-primary shadow-lg scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                LAUNCH SPECIAL
            </div>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" /> Foundation Partner
                </CardTitle>
                <CardDescription>Exclusive for early adopters in {region.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div>
                    <div className="text-4xl font-bold text-green-600">
                        {formatCurrency(0)}
                        <span className="text-lg font-normal text-gray-500">/forever*</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">*Lock in this rate by creating 1 offer today.</p>
                </div>
                
                <ul className="space-y-3 text-sm">
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> <span className="font-bold">Unlimited</span> Active Offers
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> Staff Verification App
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> "Local Hero" Badge eligibility
                </li>
                <li className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> Customer Retargeting (Basic)
                </li>
                </ul>
            </CardContent>
            <CardFooter>
                <Button className="w-full" variant={!isPro ? 'default' : 'outline'} disabled={true}>
                {!isPro ? 'Current Plan (Active)' : 'Downgrade to Foundation'}
                </Button>
            </CardFooter>
            </Card>

            {/* Featured Plan */}
            <Card className={`border-2 flex flex-col relative ${isPro ? 'border-primary shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                    Featured Partner <Star className="ml-2 h-5 w-5 text-yellow-500 fill-yellow-500" />
                </CardTitle>
                <CardDescription>Stay at the top of search results.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                 <div>
                    <div className="text-4xl font-bold">
                        {formatCurrency(billingCycle === 'monthly' ? 69 : 499)}
                        <span className="text-lg font-normal text-gray-500">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        (Guaranteed top 3 spot in category)
                    </p>
                </div>
                <ul className="space-y-3 text-sm">
                <li className="flex items-center font-medium">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> <b>Top of "Near Me"</b> Search
                </li>
                <li className="flex items-center font-medium">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> <b>Featured Badge</b> on Cards
                </li>
                <li className="flex items-center font-medium">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> Priority Support & Setup
                </li>
                 <li className="flex items-center font-medium">
                    <Check className="mr-2 h-4 w-4 text-green-500" /> Advanced Customer Analytics
                </li>
                </ul>
            </CardContent>
            <CardFooter>
                {isPro ? (
                <Button className="w-full" disabled variant="secondary">
                    Active Plan
                </Button>
                ) : (
                <Button className="w-full" disabled>
                    Coming Soon
                </Button>
                )}
            </CardFooter>
            </Card>
        </div>
      </div>

      {/* SECTION 2: ADD-ONS */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            <Handshake className="h-6 w-6 text-purple-600" /> Optional Services
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        We Set It Up For You
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">
                        {formatCurrency(199)} <span className="text-sm font-normal text-gray-500">one-time</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Don't have time? A local City Manager will visit, take professional photos, write your copy, and configure your offers.
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Pay Per Result
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                        {formatCurrency(5)} <span className="text-sm font-normal text-gray-500">per visit</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Optional: Set a "bounty" on your offer. You only pay when a customer actually redeems the coupon in-store. Zero risk.
                    </p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessSubscription;