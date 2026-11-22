import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <Card>
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <Shield className="h-6 w-6 text-primary" /> Terms of Service
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-gray-700 dark:text-gray-300">
                
                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">1. General Disclaimer</h2>
                    <p>
                        DealPass ("The Platform") acts solely as a discovery and connection platform. 
                        <strong> We do not sell the products or services listed on this app.</strong> 
                        We simply connect users with local businesses ("Merchants") who provide these offers.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">2. Redemption & Purchase</h2>
                    <p>
                        Any transaction, purchase, or booking is made directly between you ("The User") and the Merchant. 
                        DealPass is not a party to these transactions and is not responsible for the quality, safety, or legality of the items or services advertised.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">3. Credits & Unlocks</h2>
                    <p>
                        Credits are a virtual utility used to unlock coupon codes on the Platform. 
                        Unlocking a deal reveals a coupon code but does not guarantee availability of the service at the Merchant's premises (e.g., if a restaurant is fully booked). 
                        We recommend booking in advance where applicable.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">4. Merchant Responsibility</h2>
                    <p>
                        Merchants are responsible for honoring the deals they list on DealPass. 
                        However, if a Merchant refuses to honor a valid, unexpired coupon, please report it via our Support channels, and we will investigate.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">5. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of the app signifies your acceptance of any changes.
                    </p>
                </section>

                <div className="pt-6 text-sm text-gray-500">
                    Last Updated: {new Date().toLocaleDateString()}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;