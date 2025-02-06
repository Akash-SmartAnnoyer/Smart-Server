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
          // First, request notification permission
          const permission = await Notification.requestPermission();
          console.log('Notification permission status:', permission);
          
          if (permission !== 'granted') {
            throw new Error('Notification permission not granted');
          }

          // Clear any existing service workers to avoid conflicts
          const existingRegistrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(existingRegistrations.map(reg => reg.unregister()));
          
          const registration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js',
            { scope: '/' }
          );
          
          // Wait for the service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('Service worker is ready');

          // Verify the service worker state
          if (registration.active) {
            console.log('Service worker is active');
            
            // Get the push manager subscription
            const subscription = await registration.pushManager.getSubscription();
            console.log('Push subscription:', subscription);
            
            return messagingInstance;
          } else {
            console.error('Service worker is not active:', registration.active);
            throw new Error('Service worker not active');
          }
        } catch (err) {
          console.error('Service worker registration failed:', err);
          throw err;
        }
      } else {
        console.error('Service workers are not supported');
        throw new Error('Service workers not supported');
      }
    }
    console.log('Firebase messaging is not supported');
    return null;
  } catch (err) {
    console.error('Firebase messaging error:', err);
    return null;
  }
})();