import { useEffect } from 'react';
import { message } from 'antd';
import { initializeNotifications, showNotification } from '../utils/notifications';

function OrderNotifications({ userRole }) {
  useEffect(() => {
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
              url: `/admin`,
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
    };
  }, [userRole]);

  return null; // This component doesn't render anything
}

export default OrderNotifications; 