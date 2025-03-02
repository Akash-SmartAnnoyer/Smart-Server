self.addEventListener('notificationclick', function(event) {
  const data = event.notification.data;

  // Clear unviewed orders only when actually viewing them
  if (event.action === 'view' || !event.action) {
    event.notification.close();
    localStorage.removeItem('unviewedOrders');
  }

  switch(event.action) {
    case 'view':
      // Open admin page
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
          return clients.openWindow(data.url);
        })
      );
      break;
    
    case 'accept':
      localStorage.removeItem('pendingNotificationOrders');
      // Accept order and open admin page
      event.waitUntil(
        fetch('/api/orders/accept', {
          method: 'POST',
          body: JSON.stringify(data.orders)
        }).then(() => clients.openWindow(data.url))
      );
      break;
    
    default:
      // Default to opening admin page
      event.waitUntil(clients.openWindow(data.url));
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