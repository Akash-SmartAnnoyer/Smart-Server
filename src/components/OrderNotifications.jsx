import { useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { initializeNotifications, showNotification } from '../utils/notifications';

function OrderNotifications({ userRole }) {
  const navigate = useNavigate();

  useEffect(() => {
    // Add notification click handler
    const handleNotificationClick = (event) => {
      event.preventDefault();
      const url = event.notification.data?.url;
      if (url) {
        // Extract the path from the full URL
        const path = new URL(url).pathname;
        navigate(path);
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
          // Initialize notifications if not already done
          await initializeNotifications();
          
          // Show notification for new order
          await showNotification({
            title: 'New Order Received!',
            body: `Order #${data.order.displayOrderId} - Table ${data.order.tableNumber}`,
            icon: '/assets/logo-transparent-png.png',
            badge: '/assets/logo-transparent-png.png',
            data: {
              url: `${window.location.origin}/admin`, // Use full URL
              orderId: data.order.id
            }
          });

          // Also show an antd message
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
      // Remove the notification click listener
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('notificationclick', handleNotificationClick);
      }
    };
  }, [userRole, navigate]);

  return null; // This component doesn't render anything
}

export default OrderNotifications; 