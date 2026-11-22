import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, MessageCircle, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
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
                    <Mail className="h-6 w-6 text-primary" /> Contact Us
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-gray-700 dark:text-gray-300">

                <p>
                    We are happy to help with any question about DealPass, your account, or your
                    business listing. Pick the option below that fits best.
                </p>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-primary" /> Fastest: AI Concierge
                    </h2>
                    <p>
                        Have a quick question? Use the AI Concierge chat in the bottom-right corner of any
                        page. It can answer common questions about deals, credits and redemptions instantly.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" /> Email support
                    </h2>
                    <p>
                        For account, privacy or billing questions, email us at{' '}
                        <a href="mailto:support@dealpass.app" className="text-blue-600 underline dark:text-blue-400">
                            support@dealpass.app
                        </a>{' '}
                        and we will get back to you as soon as we can.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Store className="h-5 w-5 text-primary" /> Businesses
                    </h2>
                    <p>
                        Want to list your business and publish offers? Register your business from the
                        footer link, then create your first offer from your dashboard.
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

export default Contact;
