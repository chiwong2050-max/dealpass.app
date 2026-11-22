import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// In a real app, you would import a payment gateway hook/component here

const BuyCredits = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleBuy = async (amount: number, cost: number) => {
    setLoading(true);
    // Simulate API call to process payment and add credits
    try {
      // For this demo, we'll just simulate a successful transaction
      // In reality, this would be a POST to /api/credits/buy with payment token
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Since we don't have a backend endpoint for this in the demo yet,
      // we'll just show a success message. In a real app, the backend would update the balance.
      toast.success(`Successfully purchased ${amount} credits for $${cost}! (Simulation)`);
      
      // We can't actually update the balance without a backend endpoint, 
      // so we'll just refresh user data to show we tried.
      await loadUser(); 
      
    } catch (error) {
      toast.error('Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <div className="text-4xl font-bold mb-2">${pkg.cost}</div>
              <p className="text-sm text-muted-foreground">One-time payment</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={pkg.popular ? 'default' : 'outline'}
                onClick={() => handleBuy(pkg.credits, pkg.cost)}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buy Now'}
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