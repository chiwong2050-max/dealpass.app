import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Mail, Cookie, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Privacy = () => {
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
                    <Shield className="h-6 w-6 text-primary" /> Privacy Policy
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6 text-gray-700 dark:text-gray-300">

                <p>
                    DealPass is a family-friendly local deals platform. This page explains, in plain
                    language, what information we store, why we store it, and the choices you have.
                    We keep data collection to the minimum needed to run the service.
                </p>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" /> 1. What we store
                    </h2>
                    <p>When you use DealPass we may store the following:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li><strong>Account details:</strong> your email address and your name.</li>
                        <li><strong>Login credentials:</strong> a securely hashed password (we never store your raw password).</li>
                        <li><strong>Business information:</strong> if you register a business, the business name, address, contact details and the offers you publish.</li>
                        <li><strong>Activity:</strong> the deals you unlock and the redemptions you make, so coupons can be verified and your history shown to you.</li>
                        <li><strong>Credits &amp; referrals:</strong> your credit balance and referral activity that powers the free-credits system.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Cookie className="h-5 w-5 text-primary" /> 2. Cookies and local storage
                    </h2>
                    <p>
                        We use your browser's local storage to keep you signed in and to remember basic
                        preferences (such as your chosen region and language). We do not use advertising
                        cookies and we do not run third-party ad trackers on this site.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" /> 3. How we use your data
                    </h2>
                    <p>
                        Your data is used only to operate the service: to authenticate you, to display your
                        offers and redemptions, to verify coupons with the business that issued them, and to
                        credit referrals. We do not sell or rent your personal data to anyone, and we do not
                        share it with advertisers.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-primary" /> 4. Your choices
                    </h2>
                    <p>
                        You can request a copy of your data or ask us to delete your account at any time.
                        Deleting your account removes your personal details from our systems, subject to any
                        records we are legally required to keep (for example, completed redemption records).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">5. Contact us</h2>
                    <p>
                        Questions about this policy or your data? Please reach out through our{' '}
                        <Link to="/about" className="text-blue-600 underline dark:text-blue-400">support page</Link>{' '}
                        and we will be happy to help.
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

export default Privacy;
