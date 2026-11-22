import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import OffersPage from "./pages/OffersPage";
import OfferDetailsPage from "./pages/OfferDetailsPage";
import MyCoupons from "./pages/MyCoupons";
import CreateOffer from "./pages/CreateOffer";
import CreateBusiness from "./pages/CreateBusiness";
import BusinessSubscription from "./pages/BusinessSubscription";
import UserSubscription from "./pages/UserSubscription";
import BuyCredits from "./pages/BuyCredits";
import EarnCredits from "./pages/EarnCredits";
import BusinessDashboard from "./pages/BusinessDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import About from "./pages/About";
import PartnerResources from "./pages/PartnerResources";
import AgentProgram from "./pages/AgentProgram";
import ScanRedeem from "./pages/ScanRedeem";
import StaffTools from "./pages/StaffTools";
import Terms from "./pages/Terms"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AIConcierge from "./components/AIConcierge";
import InstallPWA from "./components/InstallPWA";
import PushNotificationManager from "./components/PushNotificationManager"; 
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "./hooks/useAuth";
import { RegionProvider } from "./contexts/RegionContext";

const queryClient = new QueryClient();

// Wrapper to allow useLocation inside Router
const AppContent = () => {
  const location = useLocation();
  const hideNav = ['/login', '/signup', '/scan', '/staff-tools'].some(p => location.pathname.startsWith(p));

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${!hideNav ? 'pb-20 md:pb-0' : ''}`}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
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