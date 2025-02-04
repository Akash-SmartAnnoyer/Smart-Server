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
    if (isSupportedBrowser) {
      const messagingInstance = getMessaging(app);
      
      // Register service worker for FCM
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('Service worker registered:', registration);
        } catch (err) {
          console.error('Service worker registration failed:', err);
        }
      }
      
      return messagingInstance;
    }
    console.log('Firebase messaging is not supported');
    return null;
  } catch (err) {
    console.log('Firebase messaging error:', err);
    return null;
  }
})();