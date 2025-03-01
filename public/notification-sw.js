self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Get the notification data
  const data = event.notification.data;
  
  // Handle the click action
  if (event.action === 'view' || !event.action) {
    // Open or focus the window with the order
    event.waitUntil(
      clients.matchAll({
        type: 'window'
      }).then(function(clientList) {
        // If we have a client window open, focus it
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
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