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

  if (isMobileDevice) {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/assets/logo-transparent-png.png',
        badge: '/assets/logo-transparent-png.png',
        vibrate: [200, 100, 200],
        data: notification.data,
        actions: [
          {
            action: 'view',
            title: 'View Order'
          }
        ]
      });
    }
  } else {
    new Notification(notification.title, {
      body: notification.body,
      icon: '/assets/logo-transparent-png.png'
    });
  }
};

export const showOrderNotification = (orderId, status = 'placed') => {
  const notifications = {
    placed: {
      title: 'Order Placed Successfully!',
      body: `Your order #${orderId} has been received and is being processed.`
    },
    accepted: {
      title: 'Order Accepted',
      body: `Your order #${orderId} has been accepted by the restaurant.`
    },
    preparing: {
      title: 'Order Being Prepared',
      body: `Your order #${orderId} is now being prepared.`
    },
    ready: {
      title: 'Order Ready!',
      body: `Your order #${orderId} is ready for pickup!`
    }
  };

  const notificationData = notifications[status];
  if (notificationData) {
    return showNotification(notificationData);
  }
}; 