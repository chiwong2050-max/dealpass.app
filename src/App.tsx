import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "./components/ProtectedRoute";
import AIConcierge from "./components/AIConcierge";
import InstallPWA from "./components/InstallPWA";
import PushNotificationManager from "./components/PushNotificationManager";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./hooks/useAuth";
import { RegionProvider } from "./contexts/RegionContext";

// Route pages are lazy-loaded so each becomes its own JS chunk.
// This keeps the initial bundle small and speeds up first paint on mobile.
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const OffersPage = lazy(() => import("./pages/OffersPage"));
const OfferDetailsPage = lazy(() => import("./pages/OfferDetailsPage"));
const MyCoupons = lazy(() => import("./pages/MyCoupons"));
const CreateOffer = lazy(() => import("./pages/CreateOffer"));
const CreateBusiness = lazy(() => import("./pages/CreateBusiness"));
const BusinessSubscription = lazy(() => import("./pages/BusinessSubscription"));
const UserSubscription = lazy(() => import("./pages/UserSubscription"));
const BuyCredits = lazy(() => import("./pages/BuyCredits"));
const EarnCredits = lazy(() => import("./pages/EarnCredits"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const About = lazy(() => import("./pages/About"));
const PartnerResources = lazy(() => import("./pages/PartnerResources"));
const AgentProgram = lazy(() => import("./pages/AgentProgram"));
const ScanRedeem = lazy(() => import("./pages/ScanRedeem"));
const StaffTools = lazy(() => import("./pages/StaffTools"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

const queryClient = new QueryClient();

// Fallback shown while a lazily-loaded route chunk is being fetched.
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Wrapper to allow useLocation inside Router
const AppContent = () => {
  const location = useLocation();
  const hideNav = ['/login', '/signup', '/scan', '/staff-tools'].some(p => location.pathname.startsWith(p));

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${!hideNav ? 'pb-20 md:pb-0' : ''}`}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/agent-program" element={<AgentProgram />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Standard Route */}
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/offers/:id" element={<OfferDetailsPage />} />
          
          {/* Beautiful SEO Route */}
          <Route path="/deal/:slugId" element={<OfferDetailsPage />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-coupons" element={<ProtectedRoute><MyCoupons /></ProtectedRoute>} />
          <Route path="/scan" element={<ProtectedRoute><ScanRedeem /></ProtectedRoute>} />
          <Route path="/create-business" element={<ProtectedRoute><CreateBusiness /></ProtectedRoute>} />
          <Route path="/create-offer" element={<ProtectedRoute><CreateOffer /></ProtectedRoute>} />
          <Route path="/business/dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
          <Route path="/staff-tools" element={<ProtectedRoute><StaffTools /></ProtectedRoute>} />
          <Route path="/business/subscription" element={<ProtectedRoute><BusinessSubscription /></ProtectedRoute>} />
          <Route path="/user/subscription" element={<ProtectedRoute><UserSubscription /></ProtectedRoute>} />
          <Route path="/buy-credits" element={<ProtectedRoute><BuyCredits /></ProtectedRoute>} />
          <Route path="/earn-credits" element={<ProtectedRoute><EarnCredits /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          
          {/* Internal Resources - Protected */}
          <Route path="/partner-resources" element={<ProtectedRoute><PartnerResources /></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      
      <BottomNav />
      <AIConcierge />
      <InstallPWA />
      <PushNotificationManager />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RegionProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </RegionProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
