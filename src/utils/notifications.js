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

  // Use a fixed tag for grouping all new order notifications
  const notificationTag = 'new-orders';

  if (isMobileDevice) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Get existing notifications
        const existingNotifications = await registration.getNotifications({
          tag: notificationTag
        });
        
        const count = existingNotifications.length + 1;
        
        // Close existing notifications
        existingNotifications.forEach(notification => notification.close());

        await registration.showNotification('New Orders', {
          body: count > 1 
            ? `You have ${count} new orders pending`
            : notification.body || '',
          icon: '/assets/logo-transparent-png.png',
          badge: '/assets/logo-transparent-png.png',
          vibrate: [200, 100, 200],
          data: { 
            orderId: notification.data?.orderId,
            url: adminUrl,
            requiresAuth: true,
            count: count
          },
          actions: [
            {
              action: 'view',
              title: 'View Orders'
            }
          ],
          requireInteraction: true,
          tag: notificationTag, // Use same tag to group notifications
          renotify: true // Notify even if using same tag
        });

      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  } else {
    // Desktop notification handling
    if (Notification.permission === 'granted') {
      // Close existing notifications with same tag
      const existingNotifications = await window.registration?.getNotifications({
        tag: notificationTag
      }) || [];
      
      const count = existingNotifications.length + 1;
      
      existingNotifications.forEach(notification => notification.close());

      const notif = new Notification('New Orders', {
        body: count > 1 
          ? `You have ${count} new orders pending`
          : notification.body || '',
        icon: '/assets/logo-transparent-png.png',
        data: { 
          orderId: notification.data?.orderId,
          url: adminUrl,
          requiresAuth: true,
          count: count
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