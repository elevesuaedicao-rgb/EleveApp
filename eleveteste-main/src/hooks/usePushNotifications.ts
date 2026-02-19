import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, [user]);

  const checkExistingSubscription = async () => {
    if (!user) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        // Verify if this subscription exists in the database
        // Using type assertion since types may not be regenerated yet
        const { data } = await (supabase
          .from('push_subscriptions' as 'bookings')
          .select('id')
          .eq('user_id' as 'student_id', user.id)
          .eq('endpoint' as 'status', subscription.endpoint)
          .maybeSingle() as unknown as Promise<{ data: PushSubscriptionRow | null }>);
        
        setIsSubscribed(!!data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const subscribe = useCallback(async () => {
    if (!user || !isSupported) return { success: false, error: 'Not supported or not logged in' };
    
    setLoading(true);
    
    try {
      // Request permission
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);
      
      if (permissionResult !== 'granted') {
        setLoading(false);
        return { success: false, error: 'Permission denied' };
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get push subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer
        });
      }

      const subscriptionJSON = subscription.toJSON();

      // Save to database using type assertion
      const { error } = await (supabase.from('push_subscriptions' as 'bookings').upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscriptionJSON.keys?.p256dh || '',
        auth: subscriptionJSON.keys?.auth || '',
        user_agent: navigator.userAgent
      } as unknown as Record<string, unknown>, {
        onConflict: 'user_id,endpoint'
      }) as unknown as Promise<{ error: Error | null }>);

      if (error) throw error;

      setIsSubscribed(true);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Error subscribing to push:', error);
      setLoading(false);
      return { success: false, error: String(error) };
    }
  }, [user, isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    setLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database using type assertion
        await (supabase
          .from('push_subscriptions' as 'bookings')
          .delete()
          .eq('user_id' as 'student_id', user.id)
          .eq('endpoint' as 'status', subscription.endpoint) as unknown as Promise<unknown>);
      }

      setIsSubscribed(false);
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing:', error);
      setLoading(false);
      return { success: false, error: String(error) };
    }
  }, [user]);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    subscribe,
    unsubscribe
  };
};
