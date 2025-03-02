// import { messaging, requestFCMToken } from '../pages/fireBaseConfig';
// import { onMessage } from 'firebase/messaging';
// import { createRoot } from 'react-dom/client';
// import PopupNotification from '../components/PopupNotification';

// export const initializeNotifications = async () => {
//   try {
//     // Request notification permission
//     if (!('Notification' in window)) {
//       console.error('This browser does not support notifications');
//       return false;
//     }

//     let permission = Notification.permission;
//     if (permission !== 'granted') {
//       permission = await Notification.requestPermission();
//     }

//     if (permission !== 'granted') {
//       console.log('Notification permission denied');
//       return false;
//     }

//     // Register service worker
//     if ('serviceWorker' in navigator) {
//       const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
//       const fcmToken = await requestFCMToken();
      
//       if (fcmToken) {
//         console.log('FCM Token:', fcmToken);
//         // Send this token to your server to store it for the user
        
//         // Handle foreground messages
//         onMessage(messaging, (payload) => {
//           console.log('Received foreground message:', payload);
//           showNotification(payload.notification);
//         });

//         return true;
//       }
//     }
    
//     return false;
//   } catch (error) {
//     console.error('Error initializing notifications:', error);
//     return false;
//   }
// };

// export const showNotification = async (notification) => {
//   const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
//   const adminUrl = `https://www.app.smart-server.in/admin?highlight=${notification.data?.orderId}`;
  
//   if (localStorage.getItem('role') === 'customer') return;

//   // Get unviewed orders from localStorage
//   let unviewedOrders = JSON.parse(localStorage.getItem('unviewedOrders') || '[]');
  
//   // Check if order already exists in unviewed orders
//   const orderExists = unviewedOrders.some(order => order.id === notification.data?.orderId);
//   if (orderExists) return; // Skip if order already exists

//   // Add new order to unviewed list
//   const newOrder = {
//     id: notification.data?.orderId,
//     // Extract table number from notification body which contains "Table X"
//     tableNumber: notification.body?.match(/Table (\d+)/)?.[1] || '',
//     timestamp: Date.now(),
//     viewed: false
//   };
  
//   unviewedOrders.push(newOrder);
//   localStorage.setItem('unviewedOrders', JSON.stringify(unviewedOrders));

//   // Show in-app popup for mobile devices
//   if (isMobileDevice) {
//     // Create popup container if it doesn't exist
//     let popupContainer = document.getElementById('popup-notification-container');
//     if (!popupContainer) {
//       popupContainer = document.createElement('div');
//       popupContainer.id = 'popup-notification-container';
//       document.body.appendChild(popupContainer);
//     }

//     // Render popup notification
//     const root = createRoot(popupContainer);
//     root.render(
//       <PopupNotification 
//         notification={notification} 
//         onClose={() => {
//           root.unmount();
//           if (popupContainer.parentNode) {
//             popupContainer.parentNode.removeChild(popupContainer);
//           }
//         }} 
//       />
//     );

//     // Show system notification
//     if ('serviceWorker' in navigator) {
//       try {
//         const registration = await navigator.serviceWorker.ready;
        
//         // Filter only unviewed orders
//         const activeOrders = unviewedOrders.filter(order => !order.viewed);
        
//         let notificationTitle, notificationBody;
        
//         if (activeOrders.length > 1) {
//           // Multiple unviewed orders
//           notificationTitle = `New Orders (${activeOrders.length})`;
//           // Show all unviewed orders on expansion
//           notificationBody = activeOrders.map(order => 
//             `Order #${order.id} from Table ${order.tableNumber}`
//           ).join('\n');
//         } else {
//           // Single order
//           notificationTitle = 'New Order Received';
//           notificationBody = `Order #${newOrder.id} from Table ${newOrder.tableNumber}`;
//         }

//         await registration.showNotification(notificationTitle, {
//           body: notificationBody,
//           icon: '/assets/logo-transparent-png.png',
//           badge: '/assets/logo-transparent-png.png',
//           vibrate: [200, 100, 200],
//           data: { 
//             orderId: notification.data?.orderId,
//             url: adminUrl,
//             requiresAuth: true,
//             unviewedOrders: activeOrders
//           },
//           actions: [
//             {
//               action: 'view',
//               title: activeOrders.length > 1 ? 
//                 `View ${activeOrders.length} Orders` : 
//                 'View Order'
//             }
//           ],
//           requireInteraction: true,
//           tag: 'new-orders',
//           renotify: true
//         });

//       } catch (error) {
//         console.error('Error showing notification:', error);
//       }
//     }
//   } else {
//     // Desktop notification handling
//     if (Notification.permission === 'granted') {
//       // Filter only unviewed orders
//       const activeOrders = unviewedOrders.filter(order => !order.viewed);
      
//       let notificationTitle, notificationBody;
      
//       if (activeOrders.length > 1) {
//         // Multiple unviewed orders
//         notificationTitle = `New Orders (${activeOrders.length})`;
//         // Show all unviewed orders on expansion
//         notificationBody = activeOrders.map(order => 
//           `Order #${order.id} from Table ${order.tableNumber}`
//         ).join('\n');
//       } else {
//         // Single order
//         notificationTitle = 'New Order Received';
//         notificationBody = `Order #${newOrder.id} from Table ${newOrder.tableNumber}`;
//       }

//       const notif = new Notification(notificationTitle, {
//         body: notificationBody,
//         icon: '/assets/logo-transparent-png.png',
//         data: { 
//           orderId: notification.data?.orderId,
//           url: adminUrl,
//           requiresAuth: true,
//           unviewedOrders: activeOrders
//         },
//         tag: 'new-orders',
//         renotify: true,
//         requireInteraction: true
//       });

//       notif.onclick = function(event) {
//         event.preventDefault();
//         // Mark clicked order as viewed
//         const updatedOrders = unviewedOrders.map(order => {
//           if (order.id === notification.data?.orderId) {
//             return { ...order, viewed: true };
//           }
//           return order;
//         });
//         localStorage.setItem('unviewedOrders', JSON.stringify(updatedOrders));
        
//         if (localStorage.getItem('role') !== 'customer') {
//           if (window.opener) {
//             window.opener.focus();
//           } else {
//             window.open(adminUrl, '_blank').focus();
//           }
//         } else {
//           alert("You don't have access to view this page.");
//         }
//       };
//     }
//   } 
// };

// export const showOrderNotification = (orderId, status = 'placed') => {
//   const notifications = {
//     placed: {
//       title: 'Order Placed Successfully!',
//       body: `Your order #${orderId} has been received and is being processed.`,
//       data: { orderId }
//     },
//     accepted: {
//       title: 'Order Accepted',
//       body: `Your order #${orderId} has been accepted by the restaurant.`,
//       data: { orderId }
//     },
//     preparing: {
//       title: 'Order Being Prepared',
//       body: `Your order #${orderId} is now being prepared.`,
//       data: { orderId }
//     },
//     ready: {
//       title: 'Order Ready!',
//       body: `Your order #${orderId} is ready for pickup!`,
//       data: { orderId }
//     }
//   };

//   const notificationData = notifications[status];
//   if (notificationData) {
//     return showNotification(notificationData);
//   }
// }; 
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