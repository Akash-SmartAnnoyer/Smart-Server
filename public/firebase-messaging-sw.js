// Log the service worker initialization
console.log('Firebase messaging service worker initializing...');

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyARms0nFhoQqtAojws1H4ffJfxKH9MBuJ4",
  authDomain: "production-firestore-db.firebaseapp.com",
  projectId: "production-firestore-db",
  storageBucket: "production-firestore-db.appspot.com",
  messagingSenderId: "796625414381",
  appId: "1:796625414381:web:1dcbd55e84a3502b8744e4"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Log service worker installation
  self.addEventListener('install', (event) => {
    console.log('[Firebase SW] Installing Service Worker...', event);
    event.waitUntil(self.skipWaiting());
  });

  // Log service worker activation
  self.addEventListener('activate', (event) => {
    console.log('[Firebase SW] Activating Service Worker...', event);
    event.waitUntil(self.clients.claim());
  });

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log('[Firebase SW] Received background message:', payload);
    
    if (!payload?.notification) {
      console.error('[Firebase SW] Invalid payload structure:', payload);
      return;
    }

    const notificationTitle = payload.notification.title || 'New Notification';
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: payload.data || {},
      tag: payload.data?.orderId || Date.now().toString(),
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions)
      .catch((error) => {
        console.error('[Firebase SW] Error showing notification:', error);
      });
  });

  // Handle push events
  self.addEventListener('push', function(event) {
    console.log('[Firebase SW] Push event received:', event);
    if (event.data) {
      const data = event.data.json();
      console.log('[Firebase SW] Push event data:', data);
    }
  });

  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    console.log('[Firebase SW] Notification clicked:', event);
    event.notification.close();
    const orderId = event.notification.tag;
    
    const baseUrl = self.registration.scope;
    const url = `${baseUrl}waiting/${orderId}`;

    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((windowClients) => {
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
} catch (error) {
  console.error('[Firebase SW] Initialization error:', error);
}