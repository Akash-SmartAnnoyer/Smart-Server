self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Get the notification data
  const data = event.notification.data;
  
  // Handle the click action
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then(function(clientList) {
        // Check if any client has the admin page open
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes('/admin')) {
            return client.focus();
          }
        }
        
        // If no window is open and user has access
        if (clients.openWindow) {
          // We'll open the window but the App.jsx router will handle access control
          return clients.openWindow(data.url);
        }
      })
    );
  }
});

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.notification.title, {
        ...data.notification,
        data: data.notification.data
      })
    );
  }
}); 