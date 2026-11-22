import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Wallet, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  
  // Hide on auth pages, scan page, or admin/business dashboards where screen real estate is key
  const hiddenPaths = ['/login', '/signup', '/scan', '/staff-tools'];
  const isHidden = hiddenPaths.some(path => location.pathname.startsWith(path));
  
  if (isHidden) return null;

  const isActive = (path: string) => {
      if (path === '/' && location.pathname === '/') return true;
      if (path !== '/' && location.pathname.startsWith(path)) return true;
      return false;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] z-40 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link to="/" className={`flex flex-col items-center justify-center w-full h-full touch-manipulation ${isActive('/') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Home className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/offers" className={`flex flex-col items-center justify-center w-full h-full touch-manipulation ${isActive('/offers') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Search className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">Find Deals</span>
        </Link>
        <Link to="/my-coupons" className={`flex flex-col items-center justify-center w-full h-full touch-manipulation ${isActive('/my-coupons') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Wallet className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">My Wallet</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full touch-manipulation ${isActive('/profile') ? 'text-blue-600' : 'text-gray-400'}`}>
          <User className="h-6 w-6 mb-1" />
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;