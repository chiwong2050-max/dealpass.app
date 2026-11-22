import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotificationManager = () => {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSupported(true);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    setIsSubscribed(!!subscription);
  };

  const subscribeToPush = async () => {
    if (!isAuthenticated) {
        toast.error("Please login to enable notifications.");
        return;
    }

    setLoading(true);
    try {
      // 1. Get Public Key from Backend
      const { data } = await api.get('/notifications/config'); // Need this endpoint
      const publicVapidKey = data.publicKey;

      if (!publicVapidKey) throw new Error("Server Push not configured");

      // 2. Register with Browser Push Service
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // 3. Send Subscription to Backend
      await api.post('/notifications/subscribe', subscription);
      
      setIsSubscribed(true);
      toast.success("Notifications Enabled! We'll alert you of new deals.");
    } catch (error) {
      console.error('Push Subscription failed:', error);
      toast.error('Failed to enable notifications. Check permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (!supported) return null;

  if (isSubscribed) {
      return null; // Don't show if already active
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-80 animate-in slide-in-from-bottom duration-500">
        <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-900 p-4 rounded-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <p className="font-bold text-sm">Don't miss out</p>
                    <p className="text-[10px] text-gray-500">Get alerts for new deals near you.</p>
                </div>
            </div>
            <Button size="sm" onClick={subscribeToPush} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable'}
            </Button>
        </div>
    </div>
  );
};

export default PushNotificationManager;