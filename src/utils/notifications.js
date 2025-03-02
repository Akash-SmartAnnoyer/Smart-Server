import { messaging, requestFCMToken } from '../pages/fireBaseConfig';
import { onMessage } from 'firebase/messaging';
import { createRoot } from 'react-dom/client';
import PopupNotification from '../components/PopupNotification';

export const initializeNotifications = async () => {
  try {
    // Request notification permission
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    let permission = Notification.permission;
    if (permission !== 'granted') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const fcmToken = await requestFCMToken();
      
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // Send this token to your server to store it for the user
        
        // Handle foreground messages
        onMessage(messaging, (payload) => {
          console.log('Received foreground message:', payload);
          showNotification(payload.notification);
        });

        return true;
      }
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

  // Get pending orders from localStorage
  let pendingOrders = JSON.parse(localStorage.getItem('pendingNotificationOrders') || '[]');
  
  // Add new order to pending list if not already present
  if (notification.data?.orderId && !pendingOrders.includes(notification.data.orderId)) {
    pendingOrders.push(notification.data.orderId);
    localStorage.setItem('pendingNotificationOrders', JSON.stringify(pendingOrders));
  }

  // Show in-app popup for mobile devices
  if (isMobileDevice) {
    // Create popup container if it doesn't exist
    let popupContainer = document.getElementById('popup-notification-container');
    if (!popupContainer) {
      popupContainer = document.createElement('div');
      popupContainer.id = 'popup-notification-container';
      document.body.appendChild(popupContainer);
    }

    // Render popup notification
    const root = createRoot(popupContainer);
    root.render(
      <PopupNotification 
        notification={notification} 
        onClose={() => {
          root.unmount();
          if (popupContainer.parentNode) {
            popupContainer.parentNode.removeChild(popupContainer);
          }
        }} 
      />
    );

    // Show system notification
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Get existing notifications
        const existingNotifications = await registration.getNotifications({
          tag: 'new-orders'
        });
        
        // Only update count if notifications weren't viewed (still exist)
        const count = existingNotifications.length > 0 ? pendingOrders.length : 1;
        
        // Don't close existing notifications if they weren't viewed
        if (existingNotifications.length === 0) {
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
              count: count,
              orders: pendingOrders
            },
            actions: [
              {
                action: 'view',
                title: 'View Orders'
              }
            ],
            requireInteraction: true,
            tag: 'new-orders',
            renotify: true
          });
        }

      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  } else {
    // Desktop notification handling
    if (Notification.permission === 'granted') {
      // Get existing notifications
      const existingNotifications = await window.registration?.getNotifications({
        tag: 'new-orders'
      }) || [];
      
      // Only update count if notifications weren't viewed (still exist)
      const count = existingNotifications.length > 0 ? pendingOrders.length : 1;
      
      // Don't close existing notifications if they weren't viewed
      if (existingNotifications.length === 0) {
        const notif = new Notification('New Orders', {
          body: count > 1 
            ? `You have ${count} new orders pending`
            : notification.body || '',
          icon: '/assets/logo-transparent-png.png',
          data: { 
            orderId: notification.data?.orderId,
            url: adminUrl,
            requiresAuth: true,
            count: count,
            orders: pendingOrders
          },
          tag: 'new-orders',
          renotify: true,
          requireInteraction: true
        });

        notif.onclick = function(event) {
          event.preventDefault();
          // Clear pending orders when notification is clicked
          localStorage.removeItem('pendingNotificationOrders');
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