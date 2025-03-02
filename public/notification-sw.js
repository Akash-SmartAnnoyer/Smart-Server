self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data;

  switch(event.action) {
    case 'view':
      // Open admin page
      event.waitUntil(clients.openWindow(data.url));
      break;
    
    case 'accept_all':
      // Could implement batch accept functionality
      event.waitUntil(
        fetch('/api/orders/accept-all', {
          method: 'POST',
          body: JSON.stringify(data.orders)
        }).then(() => clients.openWindow(data.url))
      );
      break;
    
    case 'mark_read':
      // Just close without opening page
      break;
    
    case 'settings':
      // Open settings page
      event.waitUntil(clients.openWindow(data.url + '/settings'));
      break;
    
    default:
      // Default action is to open admin page
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