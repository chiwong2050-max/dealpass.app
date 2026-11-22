import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, BookOpen, HelpCircle, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-2">
             <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">What is DealPass?</h1>
          <p className="text-2xl font-medium text-gray-800 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed italic">
            "DealPass is your digital pass to real-world deals and discounts. Find offers from local restaurants, family activities, beauty services and more."
          </p>
        </div>

        {/* The Philosophy */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-primary/10">
            <div className="text-center mb-8">
                <span className="text-primary font-bold uppercase tracking-wider text-sm">Our Mission</span>
                <h2 className="text-3xl font-bold mt-2 flex items-center justify-center gap-2">
                    <HeartHandshake className="w-8 h-8 text-primary"/> Connect Local
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">For Users</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Unlock coupons with credits, show them at the business, and save money on everyday outings. No upfront subscription fees required to start.
                    </p>
                </div>
                <div className="space-y-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">For Business</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        Attract new and repeat customers with trackable offers. You get a public URL and QR code for each promotion, and see exactly who comes in.
                    </p>
                </div>
            </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-8">
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" /> Common Questions
            </h2>
            <Accordion type="single" collapsible className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-medium">How do deals work?</AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300 space-y-2">
                        <ol className="list-decimal pl-5 space-y-1">
                            <li>Choose your city or area.</li>
                            <li>Browse deals by category (dining, kids, beauty, etc.).</li>
                            <li>Tap a deal to see details, including discount, dates, and conditions.</li>
                            <li>If you like it, tap <strong>Unlock</strong> and spend the required credits.</li>
                            <li>Go to the business and show the coupon or QR code from DealPass when you pay.</li>
                        </ol>
                        <p className="mt-2 text-xs italic">Note: DealPass does not sell the products or services – we just connect you with local businesses and their promotions.</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-medium">Why don’t I pay money to use DealPass at the start?</AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                        We want you to try real deals first. You start with free credits so you can unlock and use some coupons and see that they work for you. Once you see value and savings, you can decide later if you want to earn more credits or upgrade. There is no pressure to pay at the beginning.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-medium">How do I get more credits?</AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                        You can earn more credits by sharing DealPass with friends or inviting them to join. In the future, you may also be able to buy extra credits or upgrade to a membership.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                    <AccordionTrigger className="text-lg font-medium">Is this like Groupon?</AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-300">
                        Not really. With Groupon, you pay upfront for a voucher. With DealPass, you just unlock the coupon for free (using credits) and pay the business directly when you get there. This supports local businesses better as they keep 100% of the sale.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>

        {/* CTA */}
        <div className="text-center pt-12">
            <h3 className="text-2xl font-bold mb-6">Ready to start saving?</h3>
            <div className="flex justify-center gap-4">
                <Link to="/offers">
                    <Button size="lg">Browse Deals</Button>
                </Link>
                <Link to="/signup">
                    <Button size="lg" variant="outline">Create Account</Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;