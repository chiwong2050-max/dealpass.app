import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MapPin, Search, ChevronRight, Store, ArrowRight, LayoutDashboard, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import RegionLanguageSelector from "@/components/RegionLanguageSelector";

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      
      {/* 1. SIMPLE HEADER */}
      <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10 border-b border-transparent shadow-sm">
          <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-200 dark:shadow-none">D</div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">DealPass</span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             {/* If user is business owner, show dashboard link prominently */}
             {isAuthenticated && (user?.role === 'BUSINESS_OWNER' || user?.role === 'ADMIN') && (
                 <Link to="/business/dashboard">
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </Button>
                 </Link>
             )}

             {/* Restored Region/Language Selector */}
             <RegionLanguageSelector />
          </div>
      </header>

      <main className="px-4 space-y-12 pb-8">
          
          {/* 2. MAIN HERO ACTION */}
          <div className="text-center pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
                  Save on <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Food & Fun.</span>
              </h1>
              <p className="text-xl text-gray-500 max-w-md mx-auto leading-relaxed">
                  Unlock 2-for-1 meals and 50% off local activities near you. Join the club.
              </p>
              
              <Link to="/offers">
                  <Button className="w-full max-w-sm h-14 text-xl font-bold shadow-xl shadow-blue-200 dark:shadow-none rounded-full bg-blue-600 hover:bg-blue-700 transition-transform active:scale-95">
                      Find Deals Near Me
                  </Button>
              </Link>
          </div>

          {/* 3. CATEGORY PILLS (Big Touch Targets) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link to="/offers?category=Food" className="group bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-orange-100 transition-all border border-transparent hover:border-orange-200">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🍔</span>
                  <span className="font-bold text-orange-900 dark:text-orange-100">Eat & Drink</span>
              </Link>
              <Link to="/offers?category=Fun" className="group bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-purple-100 transition-all border border-transparent hover:border-purple-200">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🎟️</span>
                  <span className="font-bold text-purple-900 dark:text-purple-100">Fun & Activities</span>
              </Link>
              <Link to="/offers?category=Spa" className="group bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-pink-100 transition-all border border-transparent hover:border-pink-200">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">💆‍♀️</span>
                  <span className="font-bold text-pink-900 dark:text-pink-100">Beauty & Spa</span>
              </Link>
              <Link to="/offers?category=Services" className="group bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-blue-100 transition-all border border-transparent hover:border-blue-200">
                  <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🔧</span>
                  <span className="font-bold text-blue-900 dark:text-blue-100">Services</span>
              </Link>
          </div>

          {/* 4. VALUE PROP */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-center">How it works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm mx-auto">1</div>
                      <h3 className="font-bold">Browse</h3>
                      <p className="text-sm text-gray-500">Find exclusive local offers.</p>
                  </div>
                  <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm mx-auto">2</div>
                      <h3 className="font-bold">Unlock</h3>
                      <p className="text-sm text-gray-500">Use free credits to reveal the code.</p>
                  </div>
                  <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-xl shadow-sm mx-auto">3</div>
                      <h3 className="font-bold">Redeem</h3>
                      <p className="text-sm text-gray-500">Show phone at venue to save.</p>
                  </div>
              </div>
          </div>

          {/* 5. BUSINESS PARTNER SECTION */}
          <section className="bg-gray-900 dark:bg-black text-white rounded-3xl p-8 md:p-12 max-w-5xl mx-auto relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="space-y-4 max-w-md">
                      <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-sm">
                          <Store className="w-4 h-4" /> For Local Business
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold">Fill your empty tables.</h2>
                      <p className="text-gray-400 text-lg">
                          Stop paying for clicks. List exclusive offers for off-peak times and only give discounts to customers who actually walk in.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 pt-2">
                          <Link to="/create-business">
                              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 font-bold w-full sm:w-auto">
                                  List My Business
                              </Button>
                          </Link>
                          <Link to="/partner-resources">
                              <Button variant="outline" size="lg" className="border-gray-700 hover:bg-gray-800 text-white w-full sm:w-auto">
                                  Read Guide
                              </Button>
                          </Link>
                      </div>
                  </div>
                  
                  {/* Visual Aid */}
                  <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                      <div className="flex items-center gap-4 mb-4 border-b border-gray-700 pb-4">
                          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                              <TrendingUp className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                              <p className="font-bold text-lg">12 New Customers</p>
                              <p className="text-sm text-gray-400">This Tuesday (Quiet Night)</p>
                          </div>
                      </div>
                      <div className="space-y-2">
                          <div className="h-2 bg-gray-700 rounded-full w-48"></div>
                          <div className="h-2 bg-gray-700 rounded-full w-32"></div>
                      </div>
                  </div>
              </div>
          </section>

          {!isAuthenticated && (
              <div className="text-center pt-8">
                  <p className="text-gray-500 mb-4">Join locals saving money near you.</p>
                  <Link to="/signup">
                      <Button variant="outline" className="w-full max-w-xs h-12 text-lg border-2">Create Free Account</Button>
                  </Link>
              </div>
          )}

      </main>
      
      <Footer />
    </div>
  );
};

export default Index;