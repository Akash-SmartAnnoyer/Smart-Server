// import React, { useState, useEffect } from 'react';
// import { Card, Tag, Select, Typography, message, Spin } from 'antd';
// import { CheckOutlined, ClockCircleOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

// const { Option } = Select;
// const { Title, Text } = Typography;

// const AdminOrderComponent = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch('https://smartserver-json-server.onrender.com/history');
//         if (!response.ok) {
//           throw new Error('Failed to fetch orders');
//         }
//         const data = await response.json();
//         setOrders(data);
//       } catch (error) {
//         console.error('Failed to fetch orders', error);
//         message.error('Failed to fetch orders');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOrders();

//     const interval = setInterval(fetchOrders, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleUpdateStatus = async (orderId, newStatus) => {
//     try {
//       const updatedOrder = orders.find(order => order.id === orderId);
//       const statusMessage = getStatusMessage(newStatus);

//       const response = await fetch(`https://smartserver-json-server.onrender.com/history/${orderId}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ status: newStatus, statusMessage }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update order status');
//       }

//       setOrders(prevOrders =>
//         prevOrders.map(order =>
//           order.id === orderId ? { ...order, status: newStatus, statusMessage } : order
//         )
//       );
//       message.success(`Order #${orderId} status updated to ${newStatus}`);
//     } catch (error) {
//       console.error('Failed to update order status', error);
//       message.error('Failed to update order status');
//     }
//   };

//   const getStatusMessage = (status) => {
//     switch (status) {
//       case 'pending': return 'Your order is being processed';
//       case 'preparing': return 'Your order is being prepared';
//       case 'ready': return 'Your order is ready for pickup';
//       case 'delayed': return 'Your order is delayed. We apologize for the inconvenience';
//       default: return 'Order status unknown';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case 'pending': return <ClockCircleOutlined />;
//       case 'preparing': return <SyncOutlined spin />;
//       case 'ready': return <CheckOutlined />;
//       case 'delayed': return <ExclamationCircleOutlined />;
//       default: return null;
//     }
//   };

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'pending': return 'gold';
//       case 'preparing': return 'blue';
//       case 'ready': return 'green';
//       case 'delayed': return 'orange';
//       default: return 'default';
//     }
//   };

//   if (loading) {
//     return <Spin size="large" />;
//   }

//   return (
//     <div style={{ padding: '16px', backgroundColor: '#fff5f5', minHeight: '100vh', marginTop: '50px' }}>
//       <Title level={2} style={{ color: '#ff4d4f', marginBottom: '16px', textAlign: 'center' }}>Order Management</Title>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//         {orders.map(order => (
//           <Card 
//             key={order.id}
//             hoverable
//             style={{ backgroundColor: '#fff', borderRadius: '8px' }}
//             bodyStyle={{ padding: '16px' }}
//           >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
//               <Title level={4} style={{ margin: 0 }}>Order #{order.id}</Title>
//               <Tag color="red">Table {order.tableNumber}</Tag>
//             </div>
//             <div style={{ marginBottom: '8px' }}>
//               <Text strong>Items: </Text>
//               {order.items.map((item, index) => (
//                 <Tag key={index} color="red" style={{ margin: '2px' }}>
//                   {item.name} x{item.quantity}
//                 </Tag>
//               ))}
//             </div>
//             <div style={{ marginBottom: '8px' }}>
//               <Text strong>Total: </Text>
//               <Text>₹{order.total}</Text>
//             </div>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//               <Text type="secondary">{new Date(order.timestamp).toLocaleString()}</Text>
//               <Select
//                 value={order.status || 'pending'}
//                 style={{ width: 120 }}
//                 onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
//               >
//                 {['pending', 'preparing', 'ready', 'delayed'].map((status) => (
//                   <Option key={status} value={status}>
//                     <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
//                       {status.toUpperCase()}
//                     </Tag>
//                   </Option>
//                 ))}
//               </Select>
//             </div>
//             <div style={{ marginTop: '8px' }}>
//               <Text type="secondary">{order.statusMessage || getStatusMessage(order.status || 'pending')}</Text>
//             </div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default AdminOrderComponent;
import React, { useState, useEffect, useRef } from 'react';
import { Card, Tag, Select, Typography, message, Spin, notification } from 'antd';
import { CheckOutlined, ClockCircleOutlined, SyncOutlined, ExclamationCircleOutlined, BellOutlined } from '@ant-design/icons';

// Add your notification sound file here
import notificationSound from './notification.mp3';

const { Option } = Select;
const { Title, Text } = Typography;

const AdminOrderComponent = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState([]);
  const ws = useRef(null);
  const audioRef = useRef(new Audio(notificationSound)); // Create a ref for the audio

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://smartserver-json-server.onrender.com/history');
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();

        const sortedOrders = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setOrders(sortedOrders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
        message.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Set up WebSocket connection
    ws.current = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      const data = JSON.parse(event.data);
      if (data.type === 'newOrder') {
        setOrders(prevOrders => [data.order, ...prevOrders]);
        setNewOrders(prev => [...prev, data.order.id]);

        // Play the notification sound
        audioRef.current.play();

        notification.open({
          message: 'New Order Arrived',
          description: `Order #${data.order.id} has been placed`,
          icon: <BellOutlined style={{ color: '#ff4d4f' }} />,
        });
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updatedOrder = orders.find(order => order.id === orderId);
      const statusMessage = getStatusMessage(newStatus);

      const response = await fetch(`https://smartserver-json-server.onrender.com/history/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, statusMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus, statusMessage } : order
        )
      );

      // Send status update through WebSocket
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ 
          type: 'statusUpdate', 
          orderId: orderId, 
          status: newStatus,
          statusMessage: statusMessage
        });
        console.log('Sending WebSocket message:', message);
        ws.current.send(message);
      } else {
        console.error('WebSocket is not open. Status update not sent.');
      }

      message.success(`Order #${orderId} status updated to ${newStatus}`);

      // Remove from newOrders if present
      setNewOrders(prev => prev.filter(id => id !== orderId));
    } catch (error) {
      console.error('Failed to update order status', error);
      message.error('Failed to update order status');
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Your order is being processed';
      case 'preparing': return 'Your order is being prepared';
      case 'ready': return 'Your order is ready for pickup';
      case 'delayed': return 'Your order is delayed. We apologize for the inconvenience';
      default: return 'Order status unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'preparing': return <SyncOutlined spin />;
      case 'ready': return <CheckOutlined />;
      case 'delayed': return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'gold';
      case 'preparing': return 'blue';
      case 'ready': return 'green';
      case 'delayed': return 'orange';
      default: return 'default';
    }
  };

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#fff5f5', minHeight: '100vh', marginTop: '50px' }}>
      <Title level={2} style={{ color: '#ff4d4f', marginBottom: '16px', textAlign: 'center' }}>Order Management</Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map(order => (
          <Card 
            key={order.id}
            hoverable
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '8px',
              boxShadow: newOrders.some(newOrder => newOrder.id === order.id) ? '0 0 10px #ff4d4f' : 'none',
              animation: newOrders.some(newOrder => newOrder.id === order.id) ? 'pulse 2s infinite' : 'none'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <Title level={4} style={{ margin: 0 }}>Order #{order.id}</Title>
              <Tag color="red">Table {order.tableNumber}</Tag>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Items: </Text>
              {order.items.map((item, index) => (
                <Tag key={index} color="red" style={{ margin: '2px' }}>
                  {item.name} x{item.quantity}
                </Tag>
              ))}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text strong>Total: </Text>
              <Text>₹{order.total}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">{new Date(order.timestamp).toLocaleString()}</Text>
              <Select
                value={order.status || 'pending'}
                style={{ width: 120 }}
                onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
              >
                {['pending', 'preparing', 'ready', 'delayed'].map((status) => (
                  <Option key={status} value={status}>
                    <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                      {status.toUpperCase()}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </div>
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">{order.statusMessage || getStatusMessage(order.status || 'pending')}</Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOrderComponent;
