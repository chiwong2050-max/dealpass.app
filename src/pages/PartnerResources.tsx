import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Copy, MapPin, Sparkles, HelpCircle, Repeat, Footprints, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PartnerResources = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const scripts = {
    dealPassPitch: `I run a platform called DealPass at dealpass.app.

Instead of paying a lot for Google or Facebook ads where people might just scroll past, DealPass helps you run clear, trackable promotions that bring real customers to your door.

We create a dedicated deal page and QR code for your offer. Customers can find it in the app or by scanning your QR in-store. 

When they redeem the offer, we record it, so you can see exactly how many people came from DealPass, and how many come back again when you run new promotions.

It’s like a smarter, digital version of the old coupon books, but easier for you and your customers.`,

    localRestaurant: `Hi [Name], I'm a local partner in your area. I help restaurants fill their empty tables during the mid-week lull (like Tuesday-Wednesday nights).

I don't sell ads. I actually build a "private club" promotion for you inside my app, DealPass. 

For example, we could offer a "Members Only: 2-for-1 Main" strictly between 5pm-7pm on Tuesdays. 

I'll handle the setup and the tech. You just serve the customers. If it works, we can talk about a longer partnership. Interested in a 15-min chat?`,

    loyaltyPitch: `The "Fish & Chips" Strategy (Retention):

"Most apps just get you a customer once. We focus on bringing them back.

Imagine this:
1. You run a 'Family Pack Special' this month. 20 people redeem it.
2. Next month, you launch a new '$5 Off' deal.
3. Our AI instantly notifies those 20 people: 'Hey, you loved [Business Name] last month. Here is $5 off to go back!'

It's automatic. You don't need to build an email list. We do the retargeting for you."`
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Partner Sales Kit</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resources for the "Local Deal-Maker." Everything you need to pitch businesses for DealPass.
          </p>
        </div>

        <Tabs defaultValue="pitch" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto">
            <TabsTrigger value="pitch" className="bg-blue-50 text-blue-800 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 font-bold"><MessageSquare className="w-4 h-4 mr-2"/> The Pitch</TabsTrigger>
            <TabsTrigger value="v1" className="font-medium"><Footprints className="w-4 h-4 mr-2"/> Intro Script</TabsTrigger>
            <TabsTrigger value="loyalty" className="font-medium"><Repeat className="w-4 h-4 mr-2"/> Retention</TabsTrigger>
            <TabsTrigger value="faq">Q&A Script</TabsTrigger>
          </TabsList>

          <TabsContent value="pitch" className="space-y-6">
              <Card className="border-blue-200 bg-blue-50/30">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                          <MessageSquare className="h-6 w-6" /> The Core DealPass Pitch
                      </CardTitle>
                      <CardDescription>
                          Explain what we do in 30 seconds.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border shadow-sm text-base leading-relaxed whitespace-pre-wrap font-medium text-gray-800">
                          {scripts.dealPassPitch}
                      </div>
                      <Button className="w-full" onClick={() => copyToClipboard(scripts.dealPassPitch)}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Script to Clipboard
                      </Button>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="v1" className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-6 w-6" /> Cold Walk-in Script
                      </CardTitle>
                      <CardDescription>
                          Use this when walking into your first 10 businesses in a new city.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="bg-muted p-6 rounded-lg border shadow-sm text-base leading-relaxed whitespace-pre-wrap">
                          {scripts.localRestaurant}
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => copyToClipboard(scripts.localRestaurant)}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Script
                      </Button>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
              <Card className="border-green-200 bg-green-50/30">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-800">
                          <Repeat className="h-6 w-6" /> The Retention Engine
                      </CardTitle>
                      <CardDescription>
                          Explain how we turn one-time coupon hunters into loyal regulars.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="bg-white p-6 rounded-lg border shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
                          {scripts.loyaltyPitch}
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => copyToClipboard(scripts.loyaltyPitch)}>
                          <Copy className="mr-2 h-4 w-4" /> Copy Script
                      </Button>
                  </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <HelpCircle className="w-5 h-5 text-blue-600" /> Common Questions
                </CardTitle>
                <CardDescription>
                  Standard answers to build trust.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>What is DealPass?</AccordionTrigger>
                    <AccordionContent>
                      It’s a digital deals and promotions app where local businesses can list special offers. Users unlock coupons using credits, so they are serious about visiting.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How does it help my business?</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>You get more customers, especially in quiet times.</li>
                        <li>You only “pay” by offering a discount to people who actually walk in.</li>
                        <li>It's risk-free marketing compared to paying for clicks.</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="item-5">
                    <AccordionTrigger className="text-red-600 font-bold">"Is this like Groupon?"</AccordionTrigger>
                    <AccordionContent>
                       No. Groupon usually takes 50% of your revenue. We take <strong>0% commission</strong>. You keep 100% of the sale. We just charge a small flat membership fee for the technology (or it's free for Foundation Partners).
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PartnerResources;