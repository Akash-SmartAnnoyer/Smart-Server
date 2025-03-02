// import { useEffect } from 'react';
// import { message } from 'antd';
// import { initializeNotifications, showNotification } from '../utils/notifications';

// function OrderNotifications({ userRole }) {
//   useEffect(() => {
//     // Only proceed if user is not a customer
//     if (localStorage.getItem('role') === 'customer') {
//       return; // Exit early if user is a customer
//     }

//     // Request notification permission on component mount
//     const requestNotificationPermission = async () => {
//       if ('Notification' in window) {
//         const permission = await Notification.requestPermission();
//         console.log('Notification permission:', permission);
//       }
//     };

//     requestNotificationPermission();

//     const connectWebSocket = () => {
//       const ws = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');

//       ws.onopen = () => {
//         console.log('WebSocket connected for notifications');
        
//         // Start ping interval
//         const pingInterval = setInterval(() => {
//           if (ws.readyState === WebSocket.OPEN) {
//             ws.send(JSON.stringify({ type: 'ping' }));
//           }
//         }, 30000); // Send ping every 30 seconds

//         // Store pingInterval to clear it later
//         ws.pingInterval = pingInterval;
//       };

//       ws.onmessage = async (event) => {
//         try {
//           const data = JSON.parse(event.data);
          
//           if (data.type === 'pong') {
//             return; // Ignore pong responses
//           }
          
//           if (data.type === 'newOrder' && data.notifyRoles?.includes(userRole)) {
//             await initializeNotifications();
            
//             await showNotification({
//               title: 'New Order Received!',
//               body: `Order #${data.order.displayOrderId} - Table ${data.order.tableNumber}`,
//               icon: '/assets/logo-transparent-png.png',
//               badge: '/assets/logo-transparent-png.png',
//               data: {
//                 url: 'https://www.app.smart-server.in/admin',
//                 orderId: data.order.id
//               }
//             });

//             message.info({
//               content: `New order received for Table ${data.order.tableNumber}`,
//               duration: 5
//             });
//           }
//         } catch (error) {
//           console.error('Error handling notification:', error);
//         }
//       };

//       ws.onerror = (error) => {
//         console.error('WebSocket Error:', error);
//       };

//       ws.onclose = () => {
//         console.log('WebSocket disconnected. Attempting to reconnect...');
//         if (ws.pingInterval) {
//           clearInterval(ws.pingInterval);
//         }
//         setTimeout(connectWebSocket, 3000);
//       };

//       return ws;
//     };

//     const ws = connectWebSocket();

//     return () => {
//       if (ws) {
//         if (ws.pingInterval) {
//           clearInterval(ws.pingInterval);
//         }
//         ws.close();
//       }
//     };
//   }, [userRole]);

//   // Don't render anything for customers
//   if (localStorage.getItem('role') === 'customer') {
//     return null;
//   }

//   return null;
// }

// export default OrderNotifications; 
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

  // Store orders in an array to show in expanded view
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

        await registration.showNotification('New Orders', {
          body: `You have ${orders.length} new order${orders.length > 1 ? 's' : ''}`,
          icon: '/assets/logo-transparent-png.png',
          badge: '/assets/logo-transparent-png.png',
          vibrate: [200, 100, 200],
          data: { 
            orders: orders,
            url: adminUrl,
            requiresAuth: true
          },
          actions: [
            {
              action: 'view',
              title: 'View All Orders'
            }
          ],
          // Enable expanded view
          silent: false,
          requireInteraction: true,
          tag: notificationTag,
          renotify: true,
          // Add order details in expanded view
          options: {
            // Main notification
            body: `You have ${orders.length} new order${orders.length > 1 ? 's' : ''}`,
            // Expanded view shows order details
            expandedBody: orders.map(order => 
              `Order #${order.orderId} - Table ${order.tableNumber}\n` +
              `Items: ${order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ')}`
            ).join('\n\n')
          }
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

      existingNotifications.forEach(n => n.close());

      const notif = new Notification('New Orders', {
        body: orders.map(order => 
          `Order #${order.orderId} - Table ${order.tableNumber}\n` +
          `Items: ${order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ')}`
        ).join('\n\n'),
        icon: '/assets/logo-transparent-png.png',
        data: { 
          orders: orders,
          url: adminUrl,
          requiresAuth: true
        },
        requireInteraction: true,
        tag: notificationTag,
        renotify: true
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