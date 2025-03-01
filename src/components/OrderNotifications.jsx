import { useEffect } from 'react';
import { message } from 'antd';
import { initializeNotifications, showNotification } from '../utils/notifications';

function OrderNotifications({ userRole }) {
  useEffect(() => {
    // Add notification click handler
    const handleNotificationClick = (event) => {
      event.preventDefault();
      const url = event.notification.data?.url;
      if (url) {
        // Open in new tab
        window.open(url, '_blank');
      }
    };

    // Add the click listener when the component mounts
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('notificationclick', handleNotificationClick);
    }

    const ws = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');

    ws.onopen = () => {
      console.log('WebSocket connected for notifications');
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'newOrder' && data.notifyRoles?.includes(userRole)) {
          await initializeNotifications();
          
          await showNotification({
            title: 'New Order Received!',
            body: `Order #${data.order.displayOrderId} - Table ${data.order.tableNumber}`,
            icon: '/assets/logo-transparent-png.png',
            badge: '/assets/logo-transparent-png.png',
            data: {
              url: 'https://www.app.smart-server.in/admin', // Use the full production URL
              orderId: data.order.id
            }
          });

          message.info({
            content: `New order received for Table ${data.order.tableNumber}`,
            duration: 5
          });
        }
      } catch (error) {
        console.error('Error handling notification:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    return () => {
      if (ws) ws.close();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('notificationclick', handleNotificationClick);
      }
    };
  }, [userRole]);

  return null;
}

export default OrderNotifications; 