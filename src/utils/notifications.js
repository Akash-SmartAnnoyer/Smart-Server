import { messaging, requestFCMToken } from '../pages/fireBaseConfig';
import { onMessage } from 'firebase/messaging';

export const initializeNotifications = async () => {
  try {
    const fcmToken = await requestFCMToken();
    if (fcmToken) {
      // Store the token in your database if needed
      console.log('FCM Token:', fcmToken);
      
      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        showNotification(payload.notification);
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

export const showNotification = async (notification) => {
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const adminUrl = `https://www.app.smart-server.in/admin?highlight=${notification.data?.orderId}`;
  
  if (localStorage.getItem('role') === 'customer') return;

  const notificationTag = 'new-orders';

  try {
    // Try to get stored orders from localStorage
    let storedOrders = JSON.parse(localStorage.getItem('pendingNotificationOrders') || '[]');
    
    // Add new order to stored orders
    const newOrder = {
      orderId: notification.data.orderId,
      tableNumber: notification.data.tableNumber,
      items: notification.data.items,
      timestamp: Date.now()
    };
    
    // Add new order and remove duplicates
    storedOrders = [
      ...storedOrders.filter(order => order.orderId !== newOrder.orderId),
      newOrder
    ];
    
    // Store updated orders
    localStorage.setItem('pendingNotificationOrders', JSON.stringify(storedOrders));

    if (isMobileDevice && 'serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Close existing notifications
      const existingNotifications = await registration.getNotifications({
        tag: notificationTag
      });
      existingNotifications.forEach(n => n.close());

      // Show stacked notification
      await registration.showNotification('New Orders', {
        // Main notification shows count
        body: storedOrders.length === 1 
          ? `Table ${storedOrders[0].tableNumber}: New order #${storedOrders[0].orderId}`
          : `${storedOrders.length} new orders received`,
        
        icon: '/assets/logo-transparent-png.png',
        badge: '/assets/logo-transparent-png.png',
        vibrate: [200, 100, 200],
        
        data: { 
          orders: storedOrders,
          url: adminUrl
        },
        
        // Actions
        actions: [
          {
            action: 'view',
            title: '👁️ View Orders'
          },
          {
            action: 'accept',
            title: '✓ Accept'
          }
        ],
        
        tag: notificationTag,
        renotify: true,
        requireInteraction: true,
        
        // Expanded view settings
        silent: false,
        timestamp: Date.now(),
        
        // Format messages for expanded view
        options: {
          body: storedOrders.map(order => 
            `Order #${order.orderId} - Table ${order.tableNumber}\n` +
            order.items.map(item => `• ${item.quantity}x ${item.name}`).join('\n')
          ).join('\n\n')
        }
      });

    } else if (Notification.permission === 'granted') {
      // Desktop notification
      const notif = new Notification('New Orders', {
        body: storedOrders.length === 1 
          ? `Table ${storedOrders[0].tableNumber}: New order #${storedOrders[0].orderId}`
          : storedOrders.map(order => 
              `Order #${order.orderId} - Table ${order.tableNumber}\n` +
              order.items.map(item => `• ${item.quantity}x ${item.name}`).join('\n')
            ).join('\n\n'),
        icon: '/assets/logo-transparent-png.png',
        data: { 
          orders: storedOrders,
          url: adminUrl
        },
        tag: notificationTag,
        renotify: true,
        requireInteraction: true
      });

      notif.onclick = function(event) {
        event.preventDefault();
        if (localStorage.getItem('role') !== 'customer') {
          if (window.opener) {
            window.opener.focus();
          } else {
            window.open(adminUrl, '_blank').focus();
          }
        } else {
          alert("You don't have access to view this page.");
        }
      };
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

export const showOrderNotification = (orderId, status = 'placed') => {
  const notifications = {
    placed: {
      title: 'Order Placed Successfully!',
      body: `Your order #${orderId} has been received and is being processed.`,
      data: { orderId }
    },
    accepted: {
      title: 'Order Accepted',
      body: `Your order #${orderId} has been accepted by the restaurant.`,
      data: { orderId }
    },
    preparing: {
      title: 'Order Being Prepared',
      body: `Your order #${orderId} is now being prepared.`,
      data: { orderId }
    },
    ready: {
      title: 'Order Ready!',
      body: `Your order #${orderId} is ready for pickup!`,
      data: { orderId }
    }
  };

  const notificationData = notifications[status];
  if (notificationData) {
    return showNotification(notificationData);
  }
}; 