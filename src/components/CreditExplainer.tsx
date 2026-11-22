import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Coins, Lock, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreditExplainer = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <HelpCircle className="w-4 h-4 mr-1" /> How Credits Work
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" /> DealPass Credits
          </DialogTitle>
          <DialogDescription>
            The fair way to save. No monthly fees required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          
          <div className="grid gap-4">
              <div className="flex gap-3">
                  <div className="bg-blue-100 p-2 rounded-full h-fit text-blue-600"><Coins className="w-5 h-5"/></div>
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">1. Start for Free</h4>
                      <p className="text-xs text-muted-foreground">Every new account gets <strong>50 Free Credits</strong>. That's enough to unlock about 25 standard deals (usually 2 credits each).</p>
                  </div>
              </div>

              <div className="flex gap-3">
                  <div className="bg-purple-100 p-2 rounded-full h-fit text-purple-600"><Lock className="w-5 h-5"/></div>
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">2. Unlock & Reveal</h4>
                      <p className="text-xs text-muted-foreground">Found a deal? Tap "Unlock". We deduct credits and reveal your unique Coupon Code or QR for that specific business.</p>
                  </div>
              </div>

              <div className="flex gap-3">
                  <div className="bg-green-100 p-2 rounded-full h-fit text-green-600"><Store className="w-5 h-5"/></div>
                  <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">3. Pay at the Counter</h4>
                      <p className="text-xs text-muted-foreground">Show your phone when you pay. The business applies the discount directly to your bill. Simple.</p>
                  </div>
              </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800 text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Running low?</strong> You don't have to buy more. You can earn credits by sharing DealPass with friends or simply use the app next month (we top up active users!).
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link to="/earn-credits" className="w-full">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Get More Credits
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditExplainer;