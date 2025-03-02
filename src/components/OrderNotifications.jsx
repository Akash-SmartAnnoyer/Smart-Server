import { useEffect } from 'react';
import { message } from 'antd';
import { initializeNotifications, showNotification } from '../utils/notifications';

function OrderNotifications({ userRole }) {
  useEffect(() => {
    // Only proceed if user is not a customer
    if (localStorage.getItem('role') === 'customer') {
      return; // Exit early if user is a customer
    }

    // Request notification permission on component mount
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }
    };

    requestNotificationPermission();

    const connectWebSocket = () => {
      const ws = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');

      ws.onopen = () => {
        console.log('WebSocket connected for notifications');
        
        // Start ping interval
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000); // Send ping every 30 seconds

        // Store pingInterval to clear it later
        ws.pingInterval = pingInterval;
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            return; // Ignore pong responses
          }
          
          if (data.type === 'newOrder' && data.notifyRoles?.includes(userRole)) {
            await initializeNotifications();
            
            await showNotification({
              title: 'New Order Received!',
              body: `Order #${data.order.displayOrderId} - Table ${data.order.tableNumber}`,
              icon: '/assets/logo-transparent-png.png',
              badge: '/assets/logo-transparent-png.png',
              data: {
                url: 'https://www.app.smart-server.in/admin',
                orderId: data.order.id,
                tableNumber: data.order.tableNumber,
                items: data.order.items
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

      ws.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }
        setTimeout(connectWebSocket, 3000);
      };

      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws) {
        if (ws.pingInterval) {
          clearInterval(ws.pingInterval);
        }
        ws.close();
      }
    };
  }, [userRole]);

  // Don't render anything for customers
  if (localStorage.getItem('role') === 'customer') {
    return null;
  }

  return null;
}

export default OrderNotifications; 