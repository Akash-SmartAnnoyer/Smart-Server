import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported, getToken } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyARms0nFhoQqtAojws1H4ffJfxKH9MBuJ4",
  authDomain: "production-firestore-db.firebaseapp.com",
  projectId: "production-firestore-db",
  storageBucket: "production-firestore-db.appspot.com",
  messagingSenderId: "796625414381",
  appId: "1:796625414381:web:1dcbd55e84a3502b8744e4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Add your VAPID key here - this is critical for web push notifications
const VAPID_KEY = 'BC8DuLFuRoc15xWGyACC0F8I535dyWPW4sHFkPIEXHfEu9YGMjEt5Phvj_-HS66VDozCpAOZCqp6zL6S_FlKeUk'; // Make sure this is your actual VAPID key from Firebase Console

export const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    console.log('[FCM] Is browser supported:', isSupportedBrowser);
    
    if (!isSupportedBrowser) {
      throw new Error('Firebase messaging is not supported in this browser');
    }

    const messagingInstance = getMessaging(app);
    
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported in this browser');
    }

    // Check if notifications are supported
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported in this browser');
    }

    // Check notification permission
    let permission = Notification.permission;
    console.log('[FCM] Current notification permission:', permission);
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
      console.log('[FCM] New notification permission status:', permission);
    }

    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    // Unregister any existing service workers
    const existingRegistrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(existingRegistrations.map(reg => reg.unregister()));

    // Register new service worker
    const registration = await navigator.serviceWorker.register(
      `${window.location.origin}/firebase-messaging-sw.js`,
      {
        scope: '/'
      }
    );

    // Wait for the service worker to be ready and active
    await navigator.serviceWorker.ready;
    
    if (!registration.active) {
      throw new Error('Service worker is not active');
    }

    console.log('[FCM] Service worker registered and active');

    // Get FCM token
    try {
      console.log('[FCM] Requesting token with VAPID key:', VAPID_KEY);
      const currentToken = await getToken(messagingInstance, {
        serviceWorkerRegistration: registration,
        vapidKey: VAPID_KEY
      });

      if (!currentToken) {
        throw new Error('No FCM token received');
      }

      console.log('[FCM] Token received:', currentToken);
      
      // Store the token in localStorage for debugging
      localStorage.setItem('fcmToken', currentToken);
      
      // Test notification permission with a direct notification
      try {
        await registration.showNotification('Test Notification', {
          body: 'This is a test notification from initialization',
          icon: '/logo192.png'
        });
        console.log('[FCM] Test notification sent successfully');
      } catch (notificationError) {
        console.error('[FCM] Test notification failed:', notificationError);
      }

      return messagingInstance;
    } catch (tokenError) {
      console.error('[FCM] Error getting token:', tokenError);
      throw tokenError;
    }
  } catch (err) {
    console.error('[FCM] Setup error:', err);
    return null;
  }
})();