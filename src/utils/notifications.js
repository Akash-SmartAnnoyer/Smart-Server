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

  // Add debug logging
  console.log('Showing notification:', notification);
  console.log('Is mobile device:', isMobileDevice);

  if (isMobileDevice) {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration);

        await registration.showNotification(notification.title || 'New Notification', {
          body: notification.body || '',
          icon: '/assets/logo-transparent-png.png',
          badge: '/assets/logo-transparent-png.png',
          vibrate: [200, 100, 200],
          data: { 
            orderId: notification.data?.orderId,
            url: notification.data?.orderId ? 
              `/admin?highlight=${notification.data.orderId}` : 
              '/admin'
          },
          actions: [
            {
              action: 'view',
              title: 'View Order!!!!'
            }
          ],
          requireInteraction: true,
          tag: notification.data?.orderId || 'default'
        });
        console.log('Notification shown successfully');
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    } else {
      console.warn('Service Worker not supported');
    }
  } else {
    // Desktop notification handling remains the same
    const notif = new Notification(notification.title || 'New Notification', {
      body: notification.body || '',
      icon: '/assets/logo-transparent-png.png',
      data: { 
        orderId: notification.data?.orderId,
        url: notification.data?.orderId ? 
          `/admin?highlight=${notification.data.orderId}` : 
          '/admin'
      },
      requireInteraction: true,
      tag: notification.data?.orderId || 'default'
    });

    notif.onclick = function(event) {
      event.preventDefault();
      window.focus();
      window.location.href = this.data.orderId ? 
        `/admin?highlight=${this.data.orderId}` : 
        '/admin';
    };
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