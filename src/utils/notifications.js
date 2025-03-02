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
  
  if (localStorage.getItem('role') === 'customer') {
    return;
  }

  const notificationTag = 'new-orders';
  let orders = [];
  
  if (isMobileDevice) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Get existing notifications
        const existingNotifications = await registration.getNotifications({
          tag: notificationTag
        });
        
        // Collect orders from existing notifications
        orders = existingNotifications.map(n => ({
          orderId: n.data.orderId,
          tableNumber: n.data.tableNumber,
          items: n.data.items
        }));
        
        // Add new order
        orders.push({
          orderId: notification.data.orderId,
          tableNumber: notification.data.tableNumber,
          items: notification.data.items
        });

        // Close existing notifications
        existingNotifications.forEach(n => n.close());

        // WhatsApp-style stacked notification
        await registration.showNotification('New Orders', {
          // Main notification shows count
          body: orders.length === 1 
            ? `Table ${orders[0].tableNumber}: New order #${orders[0].orderId}`
            : `${orders.length} new orders received`,
          
          // Expanded view shows order details
          data: { 
            orders,
            url: adminUrl,
            // Format orders for expanded view
            expandedText: orders.map(order => ({
              title: `Order #${order.orderId}`,
              text: `Table ${order.tableNumber}\n${order.items.map(
                item => `• ${item.quantity}x ${item.name}`
              ).join('\n')}`
            }))
          },
          
          icon: '/assets/logo-transparent-png.png',
          badge: '/assets/logo-transparent-png.png',
          vibrate: [200, 100, 200],
          
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
          silent: false,
          requireInteraction: true,
          
          // Enable expanded view
          silent: false,
          timestamp: Date.now(),
          
          // Style for expanded view
          style: 'inbox',
          messages: orders.map(order => ({
            title: `Order #${order.orderId} - Table ${order.tableNumber}`,
            message: order.items.map(item => 
              `${item.quantity}x ${item.name}`
            ).join(', ')
          }))
        });

      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  } else {
    // Desktop notification handling
    if (Notification.permission === 'granted') {
      const existingNotifications = await window.registration?.getNotifications({
        tag: notificationTag
      }) || [];
      
      orders = existingNotifications.map(n => ({
        orderId: n.data.orderId,
        tableNumber: n.data.tableNumber,
        items: n.data.items
      }));
      
      orders.push({
        orderId: notification.data.orderId,
        tableNumber: notification.data.tableNumber,
        items: notification.data.items
      });

      existingNotifications.forEach(n => n.close());

      const notif = new Notification('New Orders', {
        body: orders.length === 1 
          ? `Table ${orders[0].tableNumber}: New order #${orders[0].orderId}`
          : orders.map(order => 
              `Order #${order.orderId} - Table ${order.tableNumber}\n` +
              order.items.map(item => `• ${item.quantity}x ${item.name}`).join('\n')
            ).join('\n\n'),
        icon: '/assets/logo-transparent-png.png',
        data: { orders, url: adminUrl },
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