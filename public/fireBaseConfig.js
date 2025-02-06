import { initializeApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

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

// Simple notification setup
export const initializeNotifications = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

// Initialize messaging only if supported
export const messaging = (async () => {
  try {
    const isSupportedBrowser = await isSupported();
    console.log('Is browser supported:', isSupportedBrowser);
    
    if (isSupportedBrowser) {
      console.log('Browser supports FCM');
      const messagingInstance = getMessaging(app);
      
      if ('serviceWorker' in navigator) {
        try {
          // First, check current permission status
          console.log('Current notification permission:', Notification.permission);
          
          // Request permission if not granted
          const permission = await Notification.requestPermission();
          console.log('New notification permission status:', permission);
          
          if (permission !== 'granted') {
            throw new Error('Notification permission not granted');
          }

          // Register service worker
          const registration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js',
            { scope: '/' }
          );
          
          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('Service worker is ready');

          // Get FCM token
          try {
            const currentToken = await getToken(messagingInstance, {
              serviceWorkerRegistration: registration,
              vapidKey: 'YOUR_VAPID_KEY' // Make sure you have this configured
            });
            if (currentToken) {
              console.log('FCM Token:', currentToken);
            } else {
              console.log('No FCM token available');
            }
          } catch (tokenError) {
            console.error('Error getting FCM token:', tokenError);
          }

          return messagingInstance;
        } catch (err) {
          console.error('Service worker registration failed:', err);
          throw err;
        }
      } else {
        console.error('Service workers are not supported');
      }
      
      return messagingInstance;
    }
    console.log('Firebase messaging is not supported');
    return null;
  } catch (err) {
    console.error('Firebase messaging error:', err);
    return null;
  }
})();