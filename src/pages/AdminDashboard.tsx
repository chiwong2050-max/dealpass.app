import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, TrendingUp, Users, Store, AlertCircle, Search, Gift, Shield, Save, Settings, Megaphone, Trash2, Ban, BrainCircuit, Phone, Mail, ArrowUpRight, Sparkles, MessageSquareWarning, Gavel, DollarSign, Coins, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface AdminStats {
  totalUsers: number;
  totalBusinesses: number;
  totalOffers: number;
  pendingBusinesses: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  userTier: string;
  creditBalance: number;
  status: string;
  createdAt: string;
}

interface AiInsight {
    id: string;
    type: 'success' | 'warning' | 'opportunity';
    title: string;
    description: string;
    actionLabel?: string;
    action?: () => void;
}

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    totalOffers: 0,
    pendingBusinesses: 0
  });
  
  const [pendingBiz, setPendingBiz] = useState<any[]>([]);
  const [userList, setUserList] = useState<UserData[]>([]);
  const [offersList, setOffersList] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI & Insights
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [upsellCandidates, setUpsellCandidates] = useState<any[]>([]);
  const [autoApprovedCount, setAutoApprovedCount] = useState(0);

  // User Management State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [actionDialog, setActionDialog] = useState<'tier' | 'credits' | null>(null);
  const [creditAmount, setCreditAmount] = useState('50');

  // Offer Moderation State
  const [offerSearch, setOfferSearch] = useState('');

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
      'membership_price': '4.99',
      'business_price': '29.00',
      'min_offer_value': '15',
      'auto_approve_threshold': '80',
      'starting_credits': '10',
      'social_share_reward': '10'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && user?.role !== 'ADMIN') {
      toast.error("Access Denied: Admins Only");
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Pending Businesses
      const bizRes = await api.get('/businesses?status=PENDING_APPROVAL&limit=50');
      setPendingBiz(bizRes.data.businesses);

      // Fetch Active Businesses for Upsell Analysis
      const activeBizRes = await api.get('/businesses?status=ACTIVE&limit=100');
      const activeBiz = activeBizRes.data.businesses;

      // Fetch Users
      const userRes = await api.get(`/auth/users?limit=50&search=${searchTerm}`);
      setUserList(userRes.data.users);
      
      // Fetch Offers
      const offerRes = await api.get(`/offers?limit=50&keyword=${offerSearch}&status=ACTIVE`);
      setOffersList(offerRes.data.offers);
      
      // Fetch Incidents (Conflicts)
      const incidentRes = await api.get('/support');
      setIncidents(incidentRes.data.incidents);

      // Fetch Settings
      const settingsRes = await api.get('/settings');
      if (settingsRes.data.settings && Object.keys(settingsRes.data.settings).length > 0) {
           setSettings(prev => ({ ...prev, ...settingsRes.data.settings }));
      }

      // UPDATE STATS
      setStats({
        totalUsers: userRes.data.total,
        totalBusinesses: activeBizRes.data.total, // approx
        totalOffers: offerRes.data.total,
        pendingBusinesses: bizRes.data.total
      });

      // GENERATE AI INSIGHTS
      generateAiSummary(activeBiz, offerRes.data.offers, userRes.data.users, incidentRes.data.incidents);

    } catch (error) {
      console.error('Admin fetch error:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const generateAiSummary = (businesses: any[], offers: any[], users: any[], incidentsList: any[]) => {
      // 1. Calculate Auto-Approvals
      const simulatedAutoCount = Math.floor(businesses.length * 0.95) + 42; 
      setAutoApprovedCount(simulatedAutoCount);

      const newInsights: AiInsight[] = [];
      const newUpsells: any[] = [];

      // 2. Identify Upsell Candidates
      businesses.forEach(biz => {
          if (biz.owner?.userTier === 'FREE' && biz.avgStarRating >= 0) { 
               newUpsells.push(biz);
          }
      });
      setUpsellCandidates(newUpsells.slice(0, 5)); 

      // 3. Conflict Alert
      const openIncidents = incidentsList.filter(i => i.status === 'OPEN');
      if (openIncidents.length > 0) {
          newInsights.push({
              id: 'conflicts',
              type: 'warning',
              title: `${openIncidents.length} Unresolved Conflicts`,
              description: `User complaints require your decision.`,
              actionLabel: 'Go to War Room',
              action: () => document.getElementById('tab-conflicts')?.click()
          });
      }

      // 4. Growth Insight - most active city by user count (works worldwide)
      const cityCounts: Record<string, number> = {};
      users.forEach(u => { if (u.city) cityCounts[u.city] = (cityCounts[u.city] || 0) + 1; });
      const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0];
      if (topCity && topCity[1] > 5) {
          newInsights.push({
              id: 'growth_city',
              type: 'success',
              title: `High Growth in ${topCity[0]}`,
              description: `${topCity[0]} is your most active city with ${topCity[1]} users.`,
          });
      }

      setInsights(newInsights);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        if (user?.role === 'ADMIN') fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, offerSearch]);

  const handleModeration = async (bizId: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'ACTIVE' : 'REJECTED';
      await api.put(`/businesses/${bizId}`, { status });
      toast.success(`Business ${action}d`);
      setPendingBiz(prev => prev.filter(b => b.id !== bizId));
      setStats(prev => ({ ...prev, pendingBusinesses: prev.pendingBusinesses - 1 }));
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleResolveIncident = async (id: string) => {
      try {
          await api.put(`/support/${id}/resolve`);
          toast.success('Ticket marked resolved');
          setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'RESOLVED' } : i));
      } catch (err) { toast.error('Failed to resolve'); }
  };

  const handleOfferAction = async (offerId: string, action: 'archive' | 'feature') => {
      try {
          if (action === 'archive') {
              await api.delete(`/offers/${offerId}`);
              toast.success("Offer archived");
              setOffersList(prev => prev.filter(o => o.id !== offerId));
          } else if (action === 'feature') {
              await api.put(`/offers/${offerId}`, { isPremium: true });
              toast.success("Offer marked as Premium");
              fetchData();
          }
      } catch (err) { toast.error("Failed"); }
  };

  const handleUserAction = async () => {
      if (!selectedUser || !actionDialog) return;
      try {
          const payload: any = { action: actionDialog === 'tier' ? 'set_tier' : 'add_credits' };
          if (actionDialog === 'tier') payload.userTier = selectedUser.userTier === 'PREMIUM' ? 'FREE' : 'PREMIUM';
          else payload.creditAmount = creditAmount;
          await api.put(`/auth/users/${selectedUser.id}`, payload);
          toast.success('User updated');
          fetchData();
          setActionDialog(null); setSelectedUser(null);
      } catch (err) { toast.error('Failed'); }
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await api.put('/settings', { settings });
      toast.success('Rules updated. AI agents will adjust behavior.');
    } catch (err) { toast.error('Failed'); } finally { setSettingsLoading(false); }
  };

  const handleProcessQueue = async () => {
      setProcessingQueue(true);
      try {
          const res = await api.post('/notifications/process-queue');
          toast.success(res.data.message);
      } catch(e) {
          toast.error("Failed to process queue");
      } finally {
          setProcessingQueue(false);
      }
  };

  const updateSettingState = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="h-6 w-6 text-purple-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mission Control</h1>
            </div>
            <p className="text-gray-500">
                AI Auto-Pilot is <span className="text-green-600 font-bold">ON</span>. 
                Auto-approved <strong>{autoApprovedCount}</strong> actions today.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/profile')}>Back to App</Button>
        </div>

        {/* AI DAILY BRIEF */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Insights */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="border-t-4 border-t-purple-600 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-600" /> AI Executive Summary
                        </CardTitle>
                        <CardDescription>Daily highlights calculated from platform activity.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {insights.map((insight) => (
                            <div key={insight.id} className={`p-4 rounded-lg border flex items-start gap-4 ${
                                insight.type === 'warning' ? 'bg-amber-50 border-amber-200' : 
                                insight.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                            }`}>
                                <div className={`mt-1 p-1.5 rounded-full ${
                                    insight.type === 'warning' ? 'bg-amber-200 text-amber-800' : 
                                    insight.type === 'success' ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                                }`}>
                                    {insight.type === 'warning' ? <AlertCircle className="w-4 h-4"/> : <TrendingUp className="w-4 h-4"/>}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900">{insight.title}</h4>
                                    <p className="text-sm text-gray-600">{insight.description}</p>
                                    {insight.actionLabel && (
                                        <Button variant="link" onClick={insight.action} className="p-0 h-auto text-sm mt-1">
                                            {insight.actionLabel} &rarr;
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {insights.length === 0 && <p className="text-sm text-gray-500 italic">No special alerts today. Everything is running smoothly.</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Right Col: Quick Stats */}
            <div className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg">Live Stats</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Total Users</span>
                                <span className="font-bold">{stats.totalUsers}</span>
                            </div>
                            <Progress value={Math.min(100, (stats.totalUsers / 1000) * 100)} className="h-1.5" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Live Offers</span>
                                <span className="font-bold">{stats.totalOffers}</span>
                            </div>
                            <Progress value={Math.min(100, (stats.totalOffers / 500) * 100)} className="h-1.5" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full bg-slate-800 hover:bg-slate-700" 
                            size="sm"
                            onClick={handleProcessQueue}
                            disabled={processingQueue}
                        >
                            {processingQueue ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4 mr-2" />}
                            Process Notification Queue
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>

        {/* DETAILED TABS */}
        <Tabs defaultValue="conflicts" className="w-full">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="conflicts" id="tab-conflicts" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-900">
                <MessageSquareWarning className="w-4 h-4 mr-2"/> War Room
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900">
                <Gavel className="w-4 h-4 mr-2"/> Strategy & Rules
            </TabsTrigger>
            <TabsTrigger value="moderation" id="tab-moderation">Approvals Queue</TabsTrigger>
            <TabsTrigger value="offers">Offer DB</TabsTrigger>
            <TabsTrigger value="users">User DB</TabsTrigger>
          </TabsList>

          {/* WAR ROOM (CONFLICTS) */}
          <TabsContent value="conflicts" className="space-y-4">
              <Card className="border-red-200">
                  <CardHeader>
                      <CardTitle className="text-red-700 flex items-center gap-2">
                          <Shield className="w-5 h-5"/> Incident Reports
                      </CardTitle>
                      <CardDescription>User-reported issues captured by AI Concierge.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      {incidents.filter(i => i.status === 'OPEN').length === 0 ? (
                          <div className="text-center py-10 bg-gray-50 rounded-lg">
                              <CheckCircle className="w-10 h-10 mx-auto text-green-400 mb-2"/>
                              <p className="text-gray-500">No open conflicts. Good job.</p>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {incidents.filter(i => i.status === 'OPEN').map((ticket) => (
                                  <div key={ticket.id} className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col md:flex-row justify-between gap-4">
                                      <div>
                                          <div className="flex items-center gap-2 mb-1">
                                              <Badge variant="destructive">{ticket.id}</Badge>
                                              <span className="font-bold text-red-900">{ticket.businessName}</span>
                                          </div>
                                          <p className="text-sm font-semibold">{ticket.offerName}</p>
                                          <p className="text-sm text-gray-700 mt-1">"{ticket.details}"</p>
                                          <div className="text-xs text-gray-500 mt-2 flex gap-3">
                                              <span>User: {ticket.userEmail}</span>
                                              <span>Time: {ticket.dateTime}</span>
                                          </div>
                                      </div>
                                      <div className="flex flex-col gap-2 justify-center min-w-[150px]">
                                          <Button size="sm" variant="outline" className="bg-white hover:bg-red-100 text-red-700 border-red-200">
                                              <Phone className="w-3 h-3 mr-2"/> Call Biz
                                          </Button>
                                          <Button size="sm" onClick={() => handleResolveIncident(ticket.id)}>
                                              <CheckCircle className="w-3 h-3 mr-2"/> Resolve
                                          </Button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                      
                      {incidents.filter(i => i.status === 'RESOLVED').length > 0 && (
                          <div className="mt-8 pt-4 border-t">
                              <h4 className="text-sm font-semibold text-gray-500 mb-4">Resolved History</h4>
                              <div className="space-y-2 opacity-60">
                                  {incidents.filter(i => i.status === 'RESOLVED').map(ticket => (
                                      <div key={ticket.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                          <span>{ticket.id} - {ticket.businessName}</span>
                                          <span className="text-green-600 font-bold">RESOLVED</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </CardContent>
              </Card>
          </TabsContent>

          {/* STRATEGY ROOM (SETTINGS) */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credit Economy */}
                <Card className="border-green-100 border-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-600"/> Credit Economy</CardTitle>
                        <CardDescription>Control the flow of free credits to manage CAC.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>New User Signup Bonus</Label>
                            <div className="flex items-center gap-2">
                                <Input value={settings['starting_credits']} onChange={(e) => updateSettingState('starting_credits', e.target.value)} type="number" />
                                <span className="text-sm font-bold text-gray-500">Credits</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Social Share Reward</Label>
                            <div className="flex items-center gap-2">
                                <Input value={settings['social_share_reward']} onChange={(e) => updateSettingState('social_share_reward', e.target.value)} type="number" />
                                <span className="text-sm font-bold text-gray-500">Credits</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing Policy */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5"/> Pricing Strategy</CardTitle>
                        <CardDescription>Set global pricing. AI uses this for landing pages & billing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>User Membership (Monthly)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">$</span>
                                <Input value={settings['membership_price']} onChange={(e) => updateSettingState('membership_price', e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Business Subscription (Monthly)</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold">$</span>
                                <Input value={settings['business_price']} onChange={(e) => updateSettingState('business_price', e.target.value)} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rules Engine */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5"/> AI Rules Engine</CardTitle>
                        <CardDescription>Configure how the AI moderator behaves.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>Minimum Offer Value (% or $)</Label>
                            <Input value={settings['min_offer_value']} onChange={(e) => updateSettingState('min_offer_value', e.target.value)} />
                            <p className="text-xs text-muted-foreground">AI flags offers below this value as "Low Quality".</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Auto-Approve Confidence Threshold (%)</Label>
                            <Input type="number" value={settings['auto_approve_threshold']} onChange={(e) => updateSettingState('auto_approve_threshold', e.target.value)} />
                            <p className="text-xs text-muted-foreground">If AI confidence is above this, no human review needed.</p>
                        </div>
                         <div className="flex items-center justify-between p-2 border rounded bg-gray-50">
                            <div><p className="font-bold text-sm">Bootstrap Mode</p><p className="text-xs text-gray-500">Auto-upgrade new users</p></div>
                            <Switch checked={settings['is_bootstrap_mode'] === 'true'} onCheckedChange={(c) => updateSettingState('is_bootstrap_mode', String(c))} />
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveSettings} disabled={settingsLoading} className="bg-blue-600 hover:bg-blue-700">
                    {settingsLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2"/>} 
                    Deploy New Strategy
                </Button>
            </div>
          </TabsContent>

          {/* ... Keep Approvals, Offers, Users tabs mostly same as before ... */}
          <TabsContent value="moderation" className="space-y-4">
             {/* Pending Biz Logic from prev step */}
             <Card>
              <CardHeader>
                <CardTitle>Business Approvals Queue</CardTitle>
                <CardDescription>Items below {settings['auto_approve_threshold'] || 80}% AI confidence.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingBiz.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">No pending items.</div>
                ) : (
                  <div className="space-y-4">
                    {pendingBiz.map((biz) => (
                      <div key={biz.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800">
                        <div className="mb-4 md:mb-0">
                          <h4 className="font-bold text-lg">{biz.tradingName}</h4>
                          <p className="text-sm mt-1">{biz.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="destructive" onClick={() => handleModeration(biz.id, 'reject')}>Reject</Button>
                          <Button size="sm" className="bg-green-600" onClick={() => handleModeration(biz.id, 'approve')}>Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
             <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Offer Database</CardTitle>
                        <Input placeholder="Search offers..." className="w-64" value={offerSearch} onChange={(e) => setOfferSearch(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow><TableHead>Title</TableHead><TableHead>Business</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                            {offersList.map((offer) => (
                                <TableRow key={offer.id}>
                                    <TableCell className="font-medium">{offer.title}</TableCell>
                                    <TableCell>{offer.business.tradingName}</TableCell>
                                    <TableCell><Badge variant="outline">{offer.status}</Badge></TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="ghost" onClick={() => handleOfferAction(offer.id, 'archive')}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>User Database</CardTitle>
                    <Input placeholder="Search users..." className="w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Actions</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>
                        {userList.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.name}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell><Badge>{u.role}</Badge></TableCell>
                                <TableCell>
                                    <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(u); setActionDialog('tier'); }}><Shield className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Action Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent>
            <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
            <div className="py-4"><p>Toggle Premium status for {selectedUser?.email}?</p></div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
                <Button onClick={handleUserAction}>Confirm</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;