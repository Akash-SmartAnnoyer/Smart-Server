// src/components/NewAdminPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Tag, Select, Typography, message, Empty, Badge, Input, Switch } from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  SoundOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  TableOutlined
} from '@ant-design/icons';
import { useAdminOrders } from '../context/AdminOrderContext';
import FoodLoader from './FoodLoader';
import notificationSound from './notification.mp3';

const { Option } = Select;
const { Text } = Typography;

const NewAdminPage = () => {
  const { orders, loading, updateOrder, setOrders } = useAdminOrders();
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrders, setNewOrders] = useState([]);
  const audioRef = useRef(new Audio(notificationSound));
  const ws = useRef(null);
  const orgId = localStorage.getItem('orgId');

  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.tableNumber?.toString().includes(searchQuery) ||
    order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (order.items && order.items.some(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  useEffect(() => {
    // Function to establish WebSocket connection
    const connectWebSocket = () => {
      ws.current = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'newOrder' && data.order.orgId === orgId) {
          setOrders(prevOrders => [data.order, ...prevOrders]);
          setNewOrders(prev => [...prev, data.order.id]);
          
          if (soundEnabled) {
            playNotificationSound();
          }

          message.success({
            content: `New order #${data.order.id} from Table ${data.order.tableNumber}`,
            icon: <BellOutlined style={{ color: '#ff4d4f' }} />
          });
        } else if (data.type === 'statusUpdate' && data.orgId === orgId) {
          setOrders(prevOrders =>
            prevOrders.map(order =>
              order.id === data.orderId 
                ? { ...order, status: data.status, statusMessage: data.statusMessage }
                : order
            )
          );

          if (soundEnabled) {
            playNotificationSound();
          }

          message.info({
            content: `Order #${data.orderId} status updated to ${data.status}`,
            icon: <SyncOutlined spin style={{ color: '#1890ff' }} />
          });
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected. Attempting to reconnect...');
        setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.current.close();
      };
    };

    if (orgId) {
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        ws.current.onclose = () => {
          console.log('WebSocket closed due to component unmount');
        };
        ws.current.close();
      }
    };
  }, [orgId, soundEnabled, setOrders]);

  const playNotificationSound = () => {
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: '#ffd700',
        icon: <ClockCircleOutlined />,
        text: 'Pending',
        bgColor: '#fffbe6'
      },
      preparing: {
        color: '#1890ff',
        icon: <SyncOutlined spin />,
        text: 'Preparing',
        bgColor: '#e6f7ff'
      },
      ready: {
        color: '#52c41a',
        icon: <CheckOutlined />,
        text: 'Ready',
        bgColor: '#f6ffed'
      },
      delayed: {
        color: '#fa8c16',
        icon: <ExclamationCircleOutlined />,
        text: 'Delayed',
        bgColor: '#fff7e6'
      },
      cancelled: {
        color: '#ff4d4f',
        icon: <CloseCircleOutlined />,
        text: 'Cancelled',
        bgColor: '#fff1f0'
      },
      completed: {
        color: '#52c41a',
        icon: <CheckOutlined />,
        text: 'Completed',
        bgColor: '#f6ffed'
      }
    };
    return configs[status] || configs.pending;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const statusMessage = getStatusMessage(newStatus);
      const success = await updateOrder(orderId, { 
        status: newStatus, 
        statusMessage 
      });

      if (!success) throw new Error('Failed to update order status');

      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'statusUpdate',
          orderId,
          status: newStatus,
          statusMessage,
          orgId
        }));
      }

      message.success(`Order #${orderId} status updated to ${newStatus}`);
      setNewOrders(prev => prev.filter(id => id !== orderId));
    } catch (error) {
      console.error('Failed to update order status:', error);
      message.error('Failed to update order status');
    }
  };

  const getStatusMessage = (status) => {
    const messages = {
      pending: 'Your order is being processed',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup',
      delayed: 'Your order is delayed. We apologize for the inconvenience',
      completed: 'Your order is completed',
      cancelled: 'Your order is cancelled'
    };
    return messages[status] || 'Order status unknown';
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
      }}>
        <FoodLoader />
        <div style={{
          marginTop: '1rem',
          color: '#FF0000',
          fontWeight: 'bold',
          fontSize: '1.2rem',
        }}>
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%),
        repeating-linear-gradient(45deg, rgba(255, 77, 79, 0.02) 0px, rgba(255, 77, 79, 0.02) 2px, transparent 2px, transparent 8px)
      `,
      padding: '8px',
      paddingTop: '90px'
    }}>
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '5px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            color: '#ff4d4f',
            fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
            fontWeight: '700',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Live Orders
          </h1>
          <p style={{ 
            color: '#666',
            margin: '10px 0 20px',
            fontSize: 'clamp(0.9rem, 2vw, 1rem)'
          }}>
            Track and manage your restaurant orders in real-time
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <Input.Search
              placeholder="Search orders by ID, items, status, or table number..."
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '500px', flex: 1 }}
              allowClear
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fff5f5',
              padding: '10px 20px',
              borderRadius: '8px'
            }}>
              <Switch
                checkedChildren={<SoundOutlined />}
                unCheckedChildren={<SoundOutlined />}
                checked={soundEnabled}
                onChange={setSoundEnabled}
                style={{ backgroundColor: soundEnabled ? '#ff4d4f' : undefined }}
              />
              <Text>Sound Alerts</Text>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Empty
            description={
              <span style={{ color: '#666', fontSize: '1.1rem' }}>
                {searchQuery ? 'No matching orders found' : 'No active orders'}
              </span>
            }
            style={{
              backgroundColor: 'white',
              padding: '60px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            padding: '10px'
          }}>
            {filteredOrders.map(order => (
              <Badge.Ribbon
                key={order.id}
                text={getStatusConfig(order.status).text}
                color={getStatusConfig(order.status).color}
              >
                <Card
                  hoverable
                  style={{
                    borderRadius: '15px',
                    boxShadow: newOrders.includes(order.id) 
                      ? '0 0 20px rgba(255, 77, 79, 0.3)'
                      : '0 4px 12px rgba(0,0,0,0.05)',
                    animation: newOrders.includes(order.id)
                      ? 'pulse 2s infinite'
                      : 'none',
                    border: 'none',
                    background: getStatusConfig(order.status).bgColor
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <Text strong style={{ fontSize: '1.2rem', color: '#ff4d4f' }}>
                        #{order.id}
                      </Text>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '5px'
                      }}>
                        <TableOutlined style={{ color: '#ff4d4f' }} />
                        <Text>Table {order.tableNumber}</Text>
                      </div>
                    </div>
                    <div style={{
                      background: '#fff5f5',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <DollarOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong style={{ color: '#ff4d4f' }}>
                        ₹{order.total}
                      </Text>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    {order?.items?.map((item, index) => (
                      <Tag
                        key={index}
                        style={{
                          margin: '4px',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        {item.quantity}x {item.name}
                      </Tag>
                    ))}
                  </div>

                  <Select
                    value={order.status}
                    style={{ width: '100%', marginBottom: '10px' }}
                    onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
                  >
                    {['pending', 'preparing', 'ready', 'delayed', 'cancelled', 'completed'].map((status) => (
                      <Option key={status} value={status}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {getStatusConfig(status).icon}
                          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>

                  <Text type="secondary" style={{ fontSize: '0.9rem' }}>
                    <ClockCircleOutlined style={{ marginRight: '8px' }} />
                    {new Date(order.timestamp).toLocaleString()}
                  </Text>
                </Card>
              </Badge.Ribbon>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewAdminPage;