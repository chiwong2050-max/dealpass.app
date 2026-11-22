import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegion } from '@/contexts/RegionContext';

const BuyCredits = () => {
  const { user } = useAuth();
  const { formatCurrency } = useRegion();

  const packages = [
    { credits: 10, cost: 2.99, popular: false, desc: "Unlock ~5 deals" },
    { credits: 25, cost: 5.99, popular: true, desc: "Unlock ~15 deals" },
    { credits: 60, cost: 11.99, popular: false, desc: "Unlock ~40 deals" },
  ];

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Top Up Credits</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Current Balance: <span className="font-bold text-primary">{user?.creditBalance} Credits</span>
        </p>
      </div>

      {/* Payments are not connected yet - make this clear instead of faking a purchase. */}
      <div className="max-w-3xl mx-auto mb-8 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold">Paid credits coming soon</p>
          <p>
            Online payments are not available yet, so purchases are disabled. In the meantime you can
            still earn credits for free by inviting friends and completing activities on the{' '}
            <Link to="/earn-credits" className="font-medium underline">Earn Credits</Link> page.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {packages.map((pkg, index) => (
          <Card key={index} className={`relative border-2 ${pkg.popular ? 'border-primary shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700'}`}>
            {pkg.popular && (
              <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-sm">
                BEST VALUE
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                <Coins className="h-8 w-8 text-yellow-500" />
                {pkg.credits}
              </CardTitle>
              <CardDescription>{pkg.desc}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-4xl font-bold mb-2">{formatCurrency(pkg.cost)}</div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={pkg.popular ? 'default' : 'outline'}
                disabled
              >
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 text-center max-w-2xl mx-auto text-sm text-muted-foreground">
        <p>
          Need unlimited access? Upgrade to <a href="/user/subscription" className="text-blue-600 underline">Premium Membership</a>.
        </p>
      </div>
    </div>
  );
};

export default BuyCredits;
