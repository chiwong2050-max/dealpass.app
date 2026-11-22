import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Heart, Users, BookOpen, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-24 md:pb-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-8">
        
        {/* Col 1: Company */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white">DealPass</h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
                <Link to="/about" className="hover:text-primary flex items-center gap-2">
                    About Us
                </Link>
            </li>
            <li>
                <Link to="/terms" className="hover:text-primary">
                    Terms of Service
                </Link>
            </li>
          </ul>
        </div>

        {/* Col 2: For Business */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Store className="w-4 h-4" /> Partners
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
                <Link to="/create-business" className="hover:text-primary font-medium text-blue-600 dark:text-blue-400">
                    Register Business
                </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Support */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900 dark:text-white">Support</h4>
          <p className="text-sm text-gray-500">
            Need help? Chat with our AI Concierge on the bottom right.
          </p>
          <div className="pt-2">
             <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-3 h-3" /> Secure Platform
             </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} DealPass. All rights reserved.</p>
        <p className="mt-2 text-gray-300 dark:text-gray-600">v{__APP_VERSION__}</p>
      </div>
    </footer>
  );
};

export default Footer;