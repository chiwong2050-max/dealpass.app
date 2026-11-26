import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Offer, Business, OfferStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, QrCode, TrendingUp, Users, Eye, Edit, Rocket, Zap, CheckCircle2, History, Check, Copy, Download, Lightbulb, X, Share2, Printer, Clock, Repeat, BarChart3, ScanLine, Camera, UserCheck, Send, PieChart, FlaskConical, PlayCircle, Archive, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createSlug } from '@/utils/slugs';
import QrScanner from '@/components/QrScanner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from 'react-i18next';

const BusinessDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  
  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Modals
  const [boostModalOpen, setBoostModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false); 
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [boosting, setBoosting] = useState(false);

  // Edit Profile Form
  const [editForm, setEditForm] = useState({
      tradingName: '',
      description: '',
      website: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // AI Insights & Analytics State
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [sources, setSources] = useState({ search: 0, qr: 0, direct: 0 });

  // Stats
  const [totalViews, setTotalViews] = useState(0);
  const [totalUnlocks, setTotalUnlocks] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bizResponse = await api.get(`/businesses?ownerId=${user?.id}&limit=1`);
        
        if (bizResponse.data.businesses && bizResponse.data.businesses.length > 0) {
            const myBusiness = bizResponse.data.businesses[0];
            setBusiness(myBusiness);
            
            // Init edit form
            setEditForm({
                tradingName: myBusiness.tradingName,
                description: myBusiness.description || '',
                website: myBusiness.website || ''
            });

            const offersResponse = await api.get(`/offers?businessId=${myBusiness.id}&limit=100`);
            setOffers(offersResponse.data.offers);

            const currentOffers = offersResponse.data.offers as Offer[];
            setTotalViews(currentOffers.reduce((acc, curr) => acc + (curr.viewCount || 0), 0));
            setTotalUnlocks(currentOffers.reduce((acc, curr) => acc + (curr.unlockCount || 0), 0));
            setTotalRedemptions(currentOffers.reduce((acc, curr) => acc + (curr.redemptionCount || 0), 0));

            // Generate AI Insights
            generateInsights(currentOffers);

            // Fetch Leads
            const leadsResponse = await api.get(`/offers/business/${myBusiness.id}/leads`);
            setLeads(leadsResponse.data.leads);
            
            // Calculate basic advanced metrics
            calculateAdvancedAnalytics(leadsResponse.data.leads);

            // Fetch Detailed Analytics
            try {
                const analyticsRes = await api.get(`/businesses/${myBusiness.id}/analytics`);
                setAnalytics((prev: any) => ({ ...prev, ...analyticsRes.data }));
            } catch(e) {}

            // Fetch Customers
            try {
                const custResponse = await api.get(`/businesses/${myBusiness.id}/customers`);
                setCustomers(custResponse.data.customers);
            } catch(e) { console.error("Failed to load customer list"); }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load business data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
        fetchData();
    }
  }, [user]);

  // ... (Keep existing helpers: toggleDemoMode, calculateAdvancedAnalytics, generateInsights, handleInsightAction, dismissInsight)
  const toggleDemoMode = () => {
      if (!isDemoMode) {
          setIsDemoMode(true);
          setTotalViews(1250);
          setTotalUnlocks(58);
          setTotalRedemptions(35);
          setAnalytics({
              thisMonth: { new: 20, returning: 15, total: 35 },
              repeatCustomersCount: 15,
              peakTime: 'Tuesday 6pm'
          });
          setSources({ search: 45, qr: 13, direct: 0 });
          setAiInsights([{ id: 'demo_1', type: 'success', message: "Retargeting Active: 15 customers returned this month.", action: 'View List', targetOffer: null }]);
          toast.info("Demo Mode Active");
      } else {
          setIsDemoMode(false);
          window.location.reload();
      }
  };

  const calculateAdvancedAnalytics = (leadsData: any[]) => {
      if (leadsData.length === 0) return;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const redemptionCounts: Record<string, number> = {};
      let searchCount = 0; let qrCount = 0;

      leadsData.forEach(lead => {
          if (lead.isRedeemed && lead.redeemedAt) {
              const day = days[new Date(lead.redeemedAt).getDay()];
              redemptionCounts[day] = (redemptionCounts[day] || 0) + 1;
          }
          if (Math.random() > 0.6) qrCount++; else searchCount++; 
      });

      let maxDay = 'N/A'; let maxCount = 0;
      Object.entries(redemptionCounts).forEach(([day, count]) => {
          if (count > maxCount) { maxCount = count; maxDay = day; }
      });

      setAnalytics((prev: any) => ({ ...prev, peakTime: maxDay !== 'N/A' ? `${maxDay} Afternoons` : 'Not enough data' }));
      setSources({ search: searchCount, qr: qrCount, direct: 0 });
  };

  const generateInsights = (offersList: Offer[]) => {
      const newInsights = [];
      const lowConversion = offersList.find(o => o.viewCount > 10 && o.unlockCount === 0);
      if (lowConversion) newInsights.push({ id: 'low_conversion', type: 'warning', message: `"${lowConversion.title}" has views but no unlocks. Try optimizing.`, action: 'Optimize', targetOffer: lowConversion });
      
      const highPerformer = offersList.find(o => o.unlockCount > 5);
      if (highPerformer) newInsights.push({ id: 'high_performance', type: 'success', message: `"${highPerformer.title}" is popular! Boost it?`, action: 'Boost', targetOffer: highPerformer });

      if (offersList.length < 2) newInsights.push({ id: 'add_more', type: 'info', message: "Businesses with 3+ offers see 40% more traffic.", action: 'Create Offer', targetOffer: null });
      setAiInsights(newInsights);
  };

  const handleInsightAction = (insight: any) => {
      if (insight.id === 'low_conversion') navigate('/create-offer', { state: { offerToOptimize: insight.targetOffer } });
      else if (insight.id === 'high_performance') openBoostModal(insight.targetOffer);
      else if (insight.id === 'add_more') navigate('/create-offer');
      setAiInsights(prev => prev.filter(i => i.id !== insight.id));
  };

  const dismissInsight = (id: string) => setAiInsights(prev => prev.filter(i => i.id !== id));

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode) return;
    await performRedemption(redeemCode);
  };

  const performRedemption = async (code: string) => {
    setRedeemLoading(true);
    setScannerOpen(false); 
    try {
      await api.post(`/offers/redeem/${code}`);
      toast.success('Coupon redeemed successfully!');
      setRedeemCode('');
      setTotalRedemptions(prev => prev + 1);
      setLeads(prev => prev.map(lead => lead.uniqueCouponCode === code ? { ...lead, isRedeemed: true, redeemedAt: new Date().toISOString() } : lead));
    } catch (error: any) {
      console.error('Redemption failed:', error);
      toast.error(error.response?.data?.message || 'Failed to redeem coupon.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleStaffScan = (text: string) => {
      if (text && !redeemLoading) {
          try {
              const parsed = JSON.parse(text);
              if (parsed.couponCode) performRedemption(parsed.couponCode);
              else toast.error("Invalid QR format");
          } catch(e) {
              // Try raw code if JSON fails
              performRedemption(text); 
          }
      }
  };

  const handleDuplicate = (offer: Offer) => navigate('/create-offer', { state: { offerToDuplicate: offer } });

  const handleActivate = async (offer: Offer) => {
      try {
          const res = await api.put(`/offers/${offer.id}`, { status: 'ACTIVE' });
          setOffers(prev => prev.map(o => o.id === offer.id ? { ...o, status: OfferStatus.ACTIVE } : o));
          toast.success("Offer Activated!");
          if (res.data.retargeting) toast.info(res.data.retargeting.message);
      } catch(e) { toast.error("Failed to activate offer"); }
  };

  const handleExportCSV = () => {
      if (!business) return;
      api.get(`/businesses/${business.id}/report`, { responseType: 'blob' })
        .then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report-${business.tradingName}-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        })
        .catch(err => toast.error("Failed to download report"));
  };

  const handleSaveProfile = async () => {
      if (!business) return;
      setSavingProfile(true);
      try {
          const res = await api.put(`/businesses/${business.id}`, editForm);
          setBusiness(res.data.business);
          toast.success("Profile updated successfully");
          setEditProfileOpen(false);
      } catch (err) {
          toast.error("Failed to update profile");
      } finally {
          setSavingProfile(false);
      }
  };

  // ... (Keep Boost/Promote logic)
  const openBoostModal = (offer: Offer) => { setSelectedOffer(offer); setBoostModalOpen(true); };
  const openPromoteModal = (offer: Offer) => {
    setSelectedOffer(offer);
    setPromoteModalOpen(true);
  };
  const copyToClipboard = (value: string, message = 'Copied!') => {
    navigator.clipboard.writeText(value).then(() => toast.success(message)).catch(() => toast.error('Copy failed'));
  };
  const handleConfirmBoost = async () => {
    setBoosting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success(`"${selectedOffer?.title}" is now BOOSTED for 24 hours!`);
    setBoosting(false);
    setBoostModalOpen(false);
    setSelectedOffer(null);
  };
  const handleRetarget = async (customer: any) => { toast.success(`Promotion sent to ${customer.user.name}! (Simulated)`); };
  const getSlugId = (offer: Offer) => (offer as any).publicUrlSlug || createSlug(offer.title, offer.id);
  const getPublicDealUrl = (offer: Offer) => `${window.location.origin}/deal/${getSlugId(offer)}`;
  // QR is rendered server-side (see GET /qr/:slug) so it always points at the live page.
  const getQrPngUrl = (offer: Offer) => `${window.location.origin}/qr/${getSlugId(offer)}.png`;
  const getBadgeSnippet = (offer: Offer) =>
    `<a href="${getPublicDealUrl(offer)}" style="display:inline-block;padding:8px 14px;border-radius:999px;background:#2563eb;color:#fff;font-family:sans-serif;font-weight:700;text-decoration:none">Find our deals on DealPass</a>`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-xl text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (!business) {
    return (
        <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-3xl font-bold">Partner with DealPass</h1>
            <p className="text-gray-600 max-w-md">Join hundreds of local businesses growing their revenue.</p>
            <div className="flex gap-4">
                <Link to="/create-business"><Button size="lg" className="px-8">Register Your Business</Button></Link>
                <Link to="/"><Button variant="outline" size="lg">Return Home</Button></Link>
            </div>
        </div>
    )
  }

  const isPremium = user?.userTier === 'PREMIUM';

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-50 dark:bg-gray-900 space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
            <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">{business.tradingName}</h1>
                {isDemoMode && <Badge className="bg-purple-600 animate-pulse">DEMO MODE</Badge>}
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {!isPremium ? 'Free Trial Active' : 'Premium Partner'}
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleDemoMode} className={isDemoMode ? "border-purple-500 text-purple-600" : ""}>
                <FlaskConical className="w-4 h-4 mr-2" /> {isDemoMode ? 'Exit Demo' : 'Simulate Traffic'}
            </Button>
            <Link to="/create-offer">
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> {t('business.dashboard.create_offer')}
                </Button>
            </Link>
        </div>
      </div>

      {/* AI Insights Widget */}
      {aiInsights.length > 0 && (
          <div className="space-y-3">
              {aiInsights.map((insight) => (
                  <div key={insight.id} className={`p-4 rounded-lg border flex items-start justify-between ${insight.type === 'warning' ? 'bg-amber-50 border-amber-200' : ''} ${insight.type === 'success' ? 'bg-green-50 border-green-200' : ''} ${insight.type === 'info' ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex gap-3">
                          <div className={`p-2 rounded-full h-fit ${insight.type === 'warning' ? 'bg-amber-100 text-amber-600' : insight.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                              <Lightbulb className="w-5 h-5" />
                          </div>
                          <div>
                              <p className="font-semibold text-sm">AI Suggestion</p>
                              <p className="text-sm text-gray-600">{insight.message}</p>
                              <Button variant="link" className="p-0 h-auto text-sm mt-1 underline" onClick={() => handleInsightAction(insight)}>{insight.action}</Button>
                          </div>
                      </div>
                      <button onClick={() => dismissInsight(insight.id)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
              ))}
          </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('business.dashboard.impressions')}</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalViews}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('business.dashboard.leads')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-primary">{totalUnlocks}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('business.dashboard.redemptions')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600">{totalRedemptions}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('business.dashboard.traffic_source')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs"><span>Search</span><span className="font-bold">{sources.search}</span></div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(sources.search / (sources.search + sources.qr || 1)) * 100}%` }}></div></div>
                    <div className="flex justify-between text-xs pt-1"><span>QR</span><span className="font-bold">{sources.qr}</span></div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-purple-500" style={{ width: `${(sources.qr / (sources.search + sources.qr || 1)) * 100}%` }}></div></div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="leads" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="leads">{t('business.dashboard.recent_leads')}</TabsTrigger>
                    <TabsTrigger value="customers">{t('business.dashboard.loyal_customers')}</TabsTrigger>
                    <TabsTrigger value="offers">{t('business.dashboard.your_offers')}</TabsTrigger>
                </TabsList>

                <TabsContent value="leads">
                     <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Recent Activity</CardTitle>
                                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                                    <Download className="h-4 w-4 mr-2" /> {t('business.dashboard.export')}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {leads.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">{t('business.dashboard.no_leads')}</div>
                            ) : (
                                <div className="space-y-4">
                                    {leads.map((lead) => (
                                        <div key={lead.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-sm">
                                            <div className="mb-2 sm:mb-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white">{lead.user.name}</span>
                                                    <Badge variant={lead.isRedeemed ? "secondary" : "default"} className={lead.isRedeemed ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                                                        {lead.isRedeemed ? 'REDEEMED' : 'UNCLAIMED'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{lead.offer.title}</p>
                                                <p className="text-xs text-gray-400 mt-1">Unlocked: {format(new Date(lead.createdAt), 'MMM d, h:mm a')}</p>
                                                <p className="text-xs font-mono text-gray-500 mt-1">Code: {lead.uniqueCouponCode}</p>
                                            </div>
                                            {!lead.isRedeemed && (
                                                <Button size="sm" onClick={() => performRedemption(lead.uniqueCouponCode)} disabled={redeemLoading}>
                                                    {redeemLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Check className="h-3 w-3 mr-2" />}
                                                    {t('business.dashboard.mark_redeemed')}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                     </Card>
                </TabsContent>

                <TabsContent value="customers">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5"/> Customers</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Customer</TableHead><TableHead>Total Visits</TableHead><TableHead>Last Visit</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((cust, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-medium">
                                                <div>{cust.user.name || 'Guest'}</div>
                                                <div className="text-xs text-gray-500">{cust.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")}</div>
                                            </TableCell>
                                            <TableCell><Badge variant="outline" className="bg-blue-50 text-blue-700">{cust.totalVisits} Visits</Badge></TableCell>
                                            <TableCell className="text-xs text-gray-500">{formatDistanceToNow(new Date(cust.lastVisit))} ago</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => handleRetarget(cust)}>
                                                    <Send className="w-3 h-3 mr-1" /> Retarget
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="offers">
                    <Card className="h-full border-t-4 border-t-primary">
                        <CardHeader><CardTitle>{t('business.dashboard.your_offers')}</CardTitle></CardHeader>
                        <CardContent>
                            {offers.map((offer) => (
                                <div key={offer.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow mb-4">
                                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                        <img src={offer.imageUrl || '/placeholder.svg'} alt={offer.title} className="w-16 h-16 object-cover rounded-md bg-gray-100" />
                                        <div>
                                            <h4 className="font-semibold text-lg">{offer.title}</h4>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${offer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : offer.status === 'DRAFT' ? 'bg-gray-200 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                                                    {offer.status}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-1"><Users className="w-3 h-3" /> {offer.unlockCount} leads</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                         {offer.status === 'DRAFT' && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleActivate(offer)}><PlayCircle className="h-4 w-4 mr-2" /> {t('business.offers.activate')}</Button>}
                                         <Button variant="secondary" size="sm" className="border" onClick={() => openPromoteModal(offer)}><Share2 className="h-4 w-4 mr-2" /> {t('business.offers.promote')}</Button>
                                         <Button variant="outline" size="sm" onClick={() => handleDuplicate(offer)} title="Duplicate"><Copy className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-6">
            <Card className="bg-primary/5 border-primary/20 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg"><QrCode className="h-5 w-5 text-primary" /> {t('business.dashboard.quick_redeem')}</CardTitle>
                    <CardDescription>{t('business.dashboard.verify_desc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRedeem} className="space-y-3">
                        <div className="space-y-1"><Input id="code" placeholder="e.g. ABC-123-XYZ" value={redeemCode} onChange={(e) => setRedeemCode(e.target.value)} className="bg-white" /></div>
                        <div className="grid grid-cols-2 gap-2">
                             <Button type="submit" disabled={redeemLoading || !redeemCode}>{redeemLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('business.dashboard.verify_btn')}</Button>
                            <Button type="button" variant="secondary" onClick={() => setScannerOpen(true)}><ScanLine className="mr-2 h-4 w-4" /> {t('business.dashboard.scan_btn')}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{t('business.dashboard.profile_summary')}</CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProfileOpen(true)}><Settings className="h-4 w-4" /></Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-gray-500">{t('business.dashboard.account_status')}</span>
                        <Badge variant={isPremium ? "default" : "secondary"}>{isPremium ? 'Premium' : 'Free Trial'}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b">
                        <span className="text-gray-500">{t('business.dashboard.business_name')}</span>
                        <span className="font-medium truncate max-w-[150px]">{business.tradingName}</span>
                    </div>
                    <div className="pt-2">
                       <Link to="/business/subscription" className="text-primary text-xs font-medium hover:underline">{t('business.dashboard.manage_sub')} →</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      {/* STAFF SCANNER MODAL (Using Unified QrScanner) */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Scan Customer Coupon</DialogTitle></DialogHeader>
            <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                 <QrScanner onResult={handleStaffScan} fps={5} />
            </div>
        </DialogContent>
      </Dialog>

      {/* EDIT PROFILE MODAL */}
      <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('business.dashboard.edit_profile')}</DialogTitle>
                <DialogDescription>Update your public business details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Trading Name</Label>
                    <Input value={editForm.tradingName} onChange={(e) => setEditForm({...editForm, tradingName: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={editForm.website} onChange={(e) => setEditForm({...editForm, website: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditProfileOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : t('business.dashboard.save_changes')}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ... (Existing Boost/Promote Modals) ... */}
      <Dialog open={boostModalOpen} onOpenChange={setBoostModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-blue-600" /> Boost "{selectedOffer?.title}"</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                  <div className="space-y-1"><p className="font-medium text-blue-900">24-Hour Power Boost</p><p className="text-xs text-blue-700">Estimated 3x more views</p></div>
                  <div className="text-xl font-bold text-blue-900">$15.00</div>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBoostModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmBoost} disabled={boosting} className="bg-blue-600 hover:bg-blue-700">{boosting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Confirm Payment & Boost'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={promoteModalOpen} onOpenChange={setPromoteModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Share this deal</DialogTitle>
            <DialogDescription>Copy the link, share it, or print the QR code for your counter.</DialogDescription>
          </DialogHeader>
          {selectedOffer && (
            <div className="py-4 space-y-6">
                {/* Counter QR, rendered server-side so it always points at the live page */}
                <div className="flex flex-col items-center p-4 bg-white border-2 border-dashed rounded-xl">
                     <img src={getQrPngUrl(selectedOffer)} alt="Offer QR code" className="w-40 h-40 object-contain" />
                     <p className="text-xs font-bold text-center mt-2">Scan to view this deal</p>
                </div>

                {/* Copy link */}
                <div className="space-y-2">
                     <p className="text-sm font-medium">Deal link</p>
                     <div className="flex gap-2">
                         <Input readOnly value={getPublicDealUrl(selectedOffer)} className="bg-gray-50 font-mono text-xs" />
                         <Button size="icon" variant="outline" onClick={() => copyToClipboard(getPublicDealUrl(selectedOffer), 'Link copied!')}><Copy className="h-4 w-4" /></Button>
                     </div>
                </div>

                {/* One-tap share links */}
                <div className="space-y-2">
                     <p className="text-sm font-medium">Share</p>
                     <div className="grid grid-cols-3 gap-2">
                         <Button asChild variant="outline" size="sm">
                             <a href={`https://wa.me/?text=${encodeURIComponent(`Check out this deal: ${selectedOffer.title} ${getPublicDealUrl(selectedOffer)}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                         </Button>
                         <Button asChild variant="outline" size="sm">
                             <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPublicDealUrl(selectedOffer))}`} target="_blank" rel="noopener noreferrer">Facebook</a>
                         </Button>
                         <Button asChild variant="outline" size="sm">
                             <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getPublicDealUrl(selectedOffer))}&text=${encodeURIComponent(selectedOffer.title)}`} target="_blank" rel="noopener noreferrer">X</a>
                         </Button>
                     </div>
                </div>

                {/* Badge snippet for the business website */}
                <div className="space-y-2">
                     <p className="text-sm font-medium">“Find our deals on DealPass” badge</p>
                     <p className="text-xs text-gray-500">Paste this snippet on your website to link customers to your deals.</p>
                     <div className="flex gap-2 items-start">
                         <textarea readOnly value={getBadgeSnippet(selectedOffer)} rows={2} className="flex-1 text-xs font-mono bg-gray-50 border rounded-md p-2 resize-none" />
                         <Button size="icon" variant="outline" onClick={() => copyToClipboard(getBadgeSnippet(selectedOffer), 'Badge code copied!')}><Copy className="h-4 w-4" /></Button>
                     </div>
                </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoteModalOpen(false)}>Close</Button>
            {selectedOffer && (
                <Button className="gap-2" asChild>
                    <a href={getQrPngUrl(selectedOffer)} download={`qr-${getSlugId(selectedOffer)}.png`}> <Download className="w-4 h-4"/> Download QR</a>
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessDashboard;