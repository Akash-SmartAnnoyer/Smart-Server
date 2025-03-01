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

  // Extract orderId from notification body if not provided in data
  const orderMatch = notification.body.match(/Order #([\w-]+)/);
  const orderId = notification.data?.orderId || (orderMatch ? orderMatch[1] : null);

  if (isMobileDevice) {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(notification.title, {
        body: notification.body,
        icon: '/assets/logo-transparent-png.png',
        badge: '/assets/logo-transparent-png.png',
        vibrate: [200, 100, 200],
        data: { 
          orderId: orderId,
          url: `/admin?highlight=${orderId}`
        },
        actions: [
          {
            action: 'view',
            title: 'View Order'
          }
        ],
        requireInteraction: true,
        tag: orderId // Add this to prevent duplicate notifications
      });
    }
  } else {
    const notif = new Notification(notification.title, {
      body: notification.body,
      icon: '/assets/logo-transparent-png.png',
      data: { 
        orderId: orderId,
        url: `/admin?highlight=${orderId}`
      },
      requireInteraction: true,
      tag: orderId // Add this to prevent duplicate notifications
    });

    notif.onclick = function(event) {
      event.preventDefault();
      window.focus();
      window.location.href = `/admin?highlight=${this.data.orderId}`;
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