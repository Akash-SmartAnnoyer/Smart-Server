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

  // Get unviewed orders from localStorage
  let unviewedOrders = JSON.parse(localStorage.getItem('unviewedOrders') || '[]');
  
  // Add new order to unviewed list
  const newOrder = {
    id: notification.data?.orderId,
    tableNumber: notification.data?.tableNumber,
    timestamp: Date.now()
  };
  unviewedOrders.push(newOrder);
  localStorage.setItem('unviewedOrders', JSON.stringify(unviewedOrders));

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
        
        let notificationTitle, notificationBody;
        
        if (unviewedOrders.length > 1) {
          // Multiple unviewed orders
          notificationTitle = `New Orders (${unviewedOrders.length})`;
          // Show all unviewed orders on expansion
          notificationBody = unviewedOrders.map(order => 
            `Order #${order.id} from Table ${order.tableNumber}`
          ).join('\n');
        } else {
          // Single order
          notificationTitle = 'New Order Received';
          notificationBody = `Order #${newOrder.id} from Table ${newOrder.tableNumber}`;
        }

        await registration.showNotification(notificationTitle, {
          body: notificationBody,
          icon: '/assets/logo-transparent-png.png',
          badge: '/assets/logo-transparent-png.png',
          vibrate: [200, 100, 200],
          data: { 
            orderId: notification.data?.orderId,
            url: adminUrl,
            requiresAuth: true,
            unviewedOrders: unviewedOrders
          },
          actions: [
            {
              action: 'view',
              title: unviewedOrders.length > 1 ? 
                `View ${unviewedOrders.length} Orders` : 
                'View Order'
            }
          ],
          requireInteraction: true,
          tag: 'new-orders',
          renotify: true
        });

      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  } else {
    // Desktop notification handling
    if (Notification.permission === 'granted') {
      let notificationTitle, notificationBody;
      
      if (unviewedOrders.length > 1) {
        // Multiple unviewed orders
        notificationTitle = `New Orders (${unviewedOrders.length})`;
        // Show all unviewed orders on expansion
        notificationBody = unviewedOrders.map(order => 
          `Order #${order.id} from Table ${order.tableNumber}`
        ).join('\n');
      } else {
        // Single order
        notificationTitle = 'New Order Received';
        notificationBody = `Order #${newOrder.id} from Table ${newOrder.tableNumber}`;
      }

      const notif = new Notification(notificationTitle, {
        body: notificationBody,
        icon: '/assets/logo-transparent-png.png',
        data: { 
          orderId: notification.data?.orderId,
          url: adminUrl,
          requiresAuth: true,
          unviewedOrders: unviewedOrders
        },
        tag: 'new-orders',
        renotify: true,
        requireInteraction: true
      });

      notif.onclick = function(event) {
        event.preventDefault();
        // Clear unviewed orders when clicked
        localStorage.removeItem('unviewedOrders');
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