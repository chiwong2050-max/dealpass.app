import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import RegionLanguageSelector from '@/components/RegionLanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Coins, Menu, Store } from 'lucide-react';

/**
 * Shared top navigation used on public pages. It shows a clear signed-in state
 * on both mobile and desktop (name, credits, My deals, Account, Admin, Log out)
 * instead of looking like a logged-out visit once the user has signed in.
 */
const SiteHeader = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const displayName = user?.name?.trim() || user?.email || 'Account';
  const creditBalance = user?.creditBalance ?? 0;
  const isAdmin = user?.role === 'ADMIN';
  const isBusinessOwner = user?.role === 'BUSINESS_OWNER';

  return (
    <header className="px-4 sm:px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 shadow-sm gap-2">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none">
          D
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">DealPass</span>
      </Link>

      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        {/* Signed-in state: always visible in big readable print (md and up inline). */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-4 min-w-0">
            <Link
              to="/my-coupons"
              className="text-base font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
            >
              My deals
            </Link>
            <Link
              to="/profile"
              className="text-base font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
            >
              Account
            </Link>
            {(isBusinessOwner || isAdmin) && (
              <Link
                to="/business/dashboard"
                className="text-base font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                Business
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="text-base font-semibold text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                Admin
              </Link>
            )}
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="text-base font-bold text-gray-900 dark:text-white truncate max-w-[10rem]">
                {displayName}
              </span>
              <span className="flex items-center gap-1 text-base font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">
                <Coins className="w-4 h-4" /> {creditBalance}
              </span>
            </span>
            <Button variant="outline" onClick={logout} className="text-base font-semibold">
              Log out
            </Button>
          </nav>
        )}

        {/* Logged out: clear Log in / Sign up links. */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="text-base font-semibold">
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="text-base font-semibold">Sign up</Button>
            </Link>
          </nav>
        )}

        <RegionLanguageSelector />

        {/* Narrow screens: the same links live in a simple menu so the header never overflows. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden h-10 w-10 rounded-full"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            {isAuthenticated ? (
              <>
                <DropdownMenuLabel className="py-3">
                  <div className="text-base font-bold text-gray-900 dark:text-white truncate">
                    {displayName}
                  </div>
                  <div className="flex items-center gap-1 text-base font-semibold text-amber-600 dark:text-amber-400">
                    <Coins className="w-4 h-4" /> {creditBalance} credits
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-base font-semibold py-2.5 cursor-pointer">
                  <Link to="/my-coupons">My deals</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-base font-semibold py-2.5 cursor-pointer">
                  <Link to="/profile">Account</Link>
                </DropdownMenuItem>
                {(isBusinessOwner || isAdmin) && (
                  <DropdownMenuItem asChild className="text-base font-semibold py-2.5 cursor-pointer">
                    <Link to="/business/dashboard">
                      <Store className="w-4 h-4 mr-2" /> Business
                    </Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild className="text-base font-semibold py-2.5 cursor-pointer">
                    <Link to="/admin/dashboard">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-base font-semibold py-2.5 cursor-pointer text-red-600"
                >
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild className="text-base font-semibold py-2.5 cursor-pointer">
                  <Link to="/login">Log in</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-base font-semibold py-2.5 cursor-pointer">
                  <Link to="/signup">Sign up</Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default SiteHeader;
