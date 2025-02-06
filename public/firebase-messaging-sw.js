importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyARms0nFhoQqtAojws1H4ffJfxKH9MBuJ4",
  authDomain: "production-firestore-db.firebaseapp.com",
  projectId: "production-firestore-db",
  storageBucket: "production-firestore-db.appspot.com",
  messagingSenderId: "796625414381",
  appId: "1:796625414381:web:1dcbd55e84a3502b8744e4"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data,
    tag: payload.data?.orderId,
    requireInteraction: true
  };

  console.log('Showing notification with:', {
    title: notificationTitle,
    options: notificationOptions
  });

  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('Notification shown successfully');
    })
    .catch((error) => {
      console.error('Error showing notification:', error);
    });
});

self.addEventListener('notificationclick', (event) => {
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

// Add this to test if the service worker is receiving messages
self.addEventListener('push', function(event) {
  console.log('Push event received:', event);
  if (event.data) {
    console.log('Push event data:', event.data.json());
  }
});