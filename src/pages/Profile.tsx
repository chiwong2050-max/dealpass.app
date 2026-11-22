import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2, CreditCard, Coins, Crown, LayoutDashboard, ShieldAlert, PiggyBank, Ticket, Globe, MapPin, Settings, Bell, Briefcase, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRegion } from '@/contexts/RegionContext';
import { REGIONS } from '@/config/regions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Profile = () => {
  const { user, loading, logout, loadUser } = useAuth();
  const { t, i18n } = useTranslation();
  const { region, setRegionCode } = useRegion();
  
  const [stats, setStats] = useState({
      savings: 0,
      unlocks: 0
  });

  const [notifications, setNotifications] = useState({
      email: true,
      push: true,
      retargeting: true
  });

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', city: '', suburb: '', country: '' });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
        if (!user) return;
        try {
            const res = await api.get('/offers/my-coupons');
            const unlocked = res.data.unlockedOffers || [];
            
            let totalSavings = 0;
            unlocked.forEach((u: any) => {
                const cost = u.offer?.creditCost || 0;
                totalSavings += (cost > 0 ? cost * 2 : 10);
            });

            setStats({
                savings: totalSavings,
                unlocks: unlocked.length
            });
            
            // Sync edit form with user data
            setEditForm({
                name: user.name || '',
                city: user.city || '',
                suburb: (user as any).suburb || '',
                country: user.country || ''
            });

        } catch (err) {
            console.error("Failed to fetch user stats", err);
        }
    };
    fetchUserStats();
  }, [user]);

  const toggleNotification = (key: keyof typeof notifications) => {
      setNotifications(prev => {
          const newState = { ...prev, [key]: !prev[key] };
          toast.success("Preferences updated");
          return newState;
      });
  };

  const handleUpdateProfile = async () => {
      setSaveLoading(true);
      try {
          await api.put('/auth/profile', editForm);
          await loadUser(); // Refresh global user state
          toast.success("Profile updated successfully");
          setIsEditing(false);
      } catch (err) {
          toast.error("Failed to update profile");
      } finally {
          setSaveLoading(false);
      }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-xl text-gray-600 dark:text-gray-400">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Profile Not Found</CardTitle>
            <CardDescription className="text-center">
              It seems you are not logged in or your user data could not be loaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1 text-center relative">
          <CardTitle className="text-3xl">User Profile</CardTitle>
          <CardDescription>View and manage your account details.</CardDescription>
          
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
             <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-gray-500 hover:text-primary">
                    <Edit2 className="w-5 h-5" />
                </Button>
             </DialogTrigger>
             <DialogContent>
                 <DialogHeader>
                     <DialogTitle>Edit Profile</DialogTitle>
                     <DialogDescription>Update your personal details.</DialogDescription>
                 </DialogHeader>
                 <div className="space-y-4 py-4">
                     <div className="space-y-2">
                         <Label>Name</Label>
                         <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                     </div>
                     <div className="space-y-2">
                         <Label>Suburb</Label>
                         <Input value={editForm.suburb} onChange={(e) => setEditForm({...editForm, suburb: e.target.value})} placeholder="e.g. Richmond" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <Label>Country</Label>
                            <Input value={editForm.country} onChange={(e) => setEditForm({...editForm, country: e.target.value})} />
                        </div>
                     </div>
                 </div>
                 <DialogFooter>
                     <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                     <Button onClick={handleUpdateProfile} disabled={saveLoading}>
                         {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                     </Button>
                 </DialogFooter>
             </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 text-center">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium mb-1">
                    <PiggyBank className="w-5 h-5" /> Est. Savings
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">${stats.savings}</div>
             </div>
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 font-medium mb-1">
                    <Ticket className="w-5 h-5" /> Deals Unlocked
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.unlocks}</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-lg font-semibold">{user.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
             <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
              <p className="text-lg font-semibold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {[(user as any).suburb, user.city, user.country].filter(Boolean).join(', ') || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Membership</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                 <Badge variant={user.userTier === 'PREMIUM' ? 'default' : 'secondary'}>
                    {user.userTier}
                 </Badge>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Credit Balance</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                 {user.creditBalance}
                 <Link to="/earn-credits">
                    <Button size="sm" variant="outline" className="h-6">
                        <Coins className="mr-1 h-3 w-3" /> Earn Credits
                    </Button>
                 </Link>
              </p>
            </div>
          </div>

          <Separator />
          
          {/* Preferences Section */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold flex items-center gap-2">
                 <Settings className="h-5 w-5" /> Preferences
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                     <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> App Region</Label>
                     <Select value={region.code} onValueChange={setRegionCode}>
                        <SelectTrigger>
                            <SelectValue>
                                <span className="flex items-center gap-2">
                                    {region.flag} {region.name} ({region.currency})
                                </span>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(REGIONS).map((r) => (
                                <SelectItem key={r.code} value={r.code}>
                                    <span className="flex items-center gap-2">
                                        {r.flag} {r.name} ({r.currency})
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                 </div>

                 <div className="space-y-2">
                     <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Language</Label>
                     <Select value={i18n.language} onValueChange={(lng) => i18n.changeLanguage(lng)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English (US)</SelectItem>
                            <SelectItem value="zh">中文 (Chinese)</SelectItem>
                        </SelectContent>
                     </Select>
                 </div>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
                 <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                         <Label className="text-base">Email Notifications</Label>
                         <p className="text-xs text-muted-foreground">Receive updates about your account.</p>
                     </div>
                     <Switch checked={notifications.email} onCheckedChange={() => toggleNotification('email')} />
                 </div>
                 <div className="flex items-center justify-between">
                     <div className="space-y-0.5">
                         <Label className="text-base flex items-center gap-2">
                             Smart Deal Alerts <Bell className="w-3 h-3 text-primary" />
                         </Label>
                         <p className="text-xs text-muted-foreground">Receive special offers from businesses you've visited.</p>
                     </div>
                     <Switch checked={notifications.retargeting} onCheckedChange={() => toggleNotification('retargeting')} />
                 </div>
             </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
             {/* Role Based Actions */}
             {user.role === 'ADMIN' && (
                <Link to="/admin/dashboard" className="w-full">
                  <Button className="w-full" variant="destructive">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Admin Console
                  </Button>
                </Link>
             )}

            {(user.role === 'BUSINESS_OWNER' || user.role === 'ADMIN') && (
              <>
                <Link to="/business/dashboard" className="w-full">
                  <Button className="w-full" variant="default">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Business Dashboard
                  </Button>
                </Link>
                <Link to="/staff-tools" className="w-full">
                  <Button className="w-full" variant="outline">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Staff Mode (Scanner)
                  </Button>
                </Link>
                <Link to="/business/subscription" className="w-full">
                   <Button className="w-full" variant="secondary">
                     <CreditCard className="mr-2 h-4 w-4" />
                     Manage Business Plan
                   </Button>
                </Link>
              </>
            )}
            
            {user.role !== 'BUSINESS_OWNER' && user.role !== 'ADMIN' && (
                <Link to="/user/subscription" className="w-full">
                   <Button className="w-full" variant="secondary">
                     <Crown className="mr-2 h-4 w-4 text-yellow-500 fill-yellow-500" />
                     Manage Membership
                   </Button>
                </Link>
            )}
            
            <Button onClick={logout} variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 mt-2">
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper for Badge in this file specifically
const Badge = ({ children, variant }: { children: React.ReactNode, variant: 'default' | 'secondary' }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${variant === 'default' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
        {children}
    </span>
);

export default Profile;