importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/logo-transparent-png.png',
    badge: '/assets/logo-transparent-png.png',
    image: payload.notification.image,
    data: payload.data,
    tag: 'new-orders',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Orders'
      }
    ],
    // This enables the high-priority system notification on Android
    priority: 'high',
    vibrate: [200, 100, 200]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data;

  // Handle notification click
  if (event.action === 'view' || !event.action) {
    const adminUrl = 'https://www.app.smart-server.in/admin';
    
    event.waitUntil(
      clients.matchAll({type: 'window'}).then(function(clientList) {
        // Focus existing admin window if open
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes('/admin')) {
            return client.focus();
          }
        }
        // Open new window if none exists
        return clients.openWindow(adminUrl);
      })
    );
  }
});