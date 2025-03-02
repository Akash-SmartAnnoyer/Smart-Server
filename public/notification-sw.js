self.addEventListener('notificationclick', function(event) {
  const data = event.notification.data;

  // Mark clicked orders as viewed
  if (event.action === 'view' || !event.action) {
    event.notification.close();
    
    // Get current unviewed orders
    const unviewedOrders = JSON.parse(localStorage.getItem('unviewedOrders') || '[]');
    
    // Mark clicked orders as viewed
    const updatedOrders = unviewedOrders.map(order => {
      if (data.unviewedOrders.some(viewedOrder => viewedOrder.id === order.id)) {
        return { ...order, viewed: true };
      }
      return order;
    });
    
    localStorage.setItem('unviewedOrders', JSON.stringify(updatedOrders));
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