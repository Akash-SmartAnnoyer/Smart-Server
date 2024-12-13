import React, { useState, useEffect, useRef } from 'react';
import { Card, Tag, Select, Typography, message, Spin, notification, Switch, Badge, Empty, Input } from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  SoundOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TableOutlined
} from '@ant-design/icons';
import notificationSound from './notification.mp3';
import FoodLoader from './FoodLoader';
import { useOrders } from '../context/OrderContext';

const { Option } = Select;
const { Title, Text } = Typography;

const AdminOrderComponent = () => {
  const { orders, setOrders, updateOrder } = useOrders();
  const [loading, setLoading] = useState(true);
  const [newOrders, setNewOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const ws = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));
  const orgId = localStorage.getItem('orgId');

  // Filter out cancelled and completed orders
  const activeOrders = orders.filter(order => 
    !['cancelled', 'completed'].includes(order.status)
  );

  
  
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
  useEffect(() => {
    fetchOrders();

    // Set up WebSocket connection
    ws.current = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      console.log('Received message:', event.data);
      const data = JSON.parse(event.data);
      if (data.type === 'newOrder' && data.order.orgId == orgId) {
        // Add the new order to the beginning of the orders array
        setOrders(prevOrders => [data.order, ...prevOrders]);
        
        // Add the new order ID to the newOrders array for highlighting
        setNewOrders(prev => [...prev, data.order.id]);

        // Play sound notification if enabled
        if (soundEnabled) {
          audioRef.current.play().catch(error => console.error('Error playing audio:', error));
        }

        // Show visual notification
        notification.open({
          message: 'New Order Arrived',
          description: `Order #${data.order.id} has been placed for Table ${data.order.tableNumber}`,
          icon: <BellOutlined style={{ color: '#ff4d4f' }} />,
          duration: 4.5,
        });
      } else if (data.type === 'statusUpdate' && data.orgId == orgId) {
        setOrders(prevOrders =>
          prevOrders?.map(order =>
            order.id == data.orderId ? { ...order, status: data.status, statusMessage: data.statusMessage } : order
          )
        );

        if (soundEnabled) {
          audioRef.current.play().catch(error => console.error('Error playing audio:', error));
        }

        notification.open({
          message: 'Order Status Updated',
          description: `Order #${data.orderId} status: ${data.status}`,
          icon: data.status === 'cancelled' ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> : <BellOutlined style={{ color: '#1890ff' }} />,
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
  }, [soundEnabled, orgId]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const statusMessage = getStatusMessage(newStatus);
      const success = await updateOrder(orderId, { 
        status: newStatus, 
        statusMessage 
      });

      if (!success) throw new Error('Failed to update order status');

      // Send status update through WebSocket
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({ 
          type: 'statusUpdate', 
          orderId, 
          status: newStatus,
          statusMessage,
          orgId 
        });
        ws.current.send(message);
      }

      message.success(`Order #${orderId} status updated to ${newStatus}`);
      setNewOrders(prev => prev.filter(id => id !== orderId));
    } catch (error) {
      console.error('Failed to update order status:', error);
      message.error('Failed to update order status');
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending': return 'Your order is being processed';
      case 'preparing': return 'Your order is being prepared';
      case 'ready': return 'Your order is ready for pickup';
      case 'delayed': return 'Your order is delayed. We apologize for the inconvenience';
      case 'completed': return 'Your order is completed.';
      case 'cancelled': return 'Your order is cancelled';
      default: return 'Order status unknown';
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`https://smart-server-menu-database-default-rtdb.firebaseio.com/history.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
  
      const data = await response.json();
  
      const ordersArray = Object.entries(data)
        .map(([key, order]) => ({
          ...order,
          id: order.id || key
        }))
        .filter(order => 
          order.orgId === orgId && 
          !['cancelled', 'completed'].includes(order.status)
        );
  
      const sortedOrders = ordersArray?.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      message.error('Failed to fetch orders');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockCircleOutlined />;
      case 'preparing': return <SyncOutlined spin />;
      case 'ready': return <CheckOutlined />;
      case 'delayed': return <ExclamationCircleOutlined />;
      case 'cancelled': return <CloseCircleOutlined />;
      case 'completed': return <CheckOutlined/>;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'gold';
      case 'preparing': return 'blue';
      case 'ready': return 'green';
      case 'delayed': return 'orange';
      case 'cancelled': return 'red';
      case 'completed': return 'green';
      default: return 'default';
    }
  };

  // Add new useEffect for search filtering
  useEffect(() => {
    if (activeOrders.length) {
      const filtered = activeOrders.filter(order => 
        order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableNumber?.toString().includes(searchQuery) ||
        order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.items && order.items.some(item => 
          item.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders([]);
    }
  }, [activeOrders, searchQuery]);

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
            flexDirection: 'column',
            gap: '15px',
            alignItems: 'center',
            '@media (min-width: 768px)': {
              flexDirection: 'row',
              justifyContent: 'center',
            }
          }}>
            <Input.Search
              placeholder="Search orders by ID, items, status, or table number..."
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                maxWidth: '100%',
                width: '100%',
                '@media (min-width: 768px)': {
                  maxWidth: '500px',
                }
              }}
              allowClear
            />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fff5f5',
              padding: '10px 20px',
              borderRadius: '8px',
              whiteSpace: 'nowrap'
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '10px',
            padding: '5px'
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
                  bodyStyle={{ padding: '20px' }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <div>
                      <Text strong style={{
                        fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
                        color: '#ff4d4f'
                      }}>
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
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {order?.items?.map((item, index) => (
                        <Tag
                          key={index}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            margin: 0,
                            background: '#fff',
                            border: '1px solid #ffccc7',
                            fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)'
                          }}
                        >
                          <Text strong style={{ color: '#ff4d4f' }}>{item.quantity}x</Text>
                          <Text> {item.name}</Text>
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <Select
                    value={order.status || 'pending'}
                    style={{ width: '100%', marginBottom: '10px' }}
                    onChange={(newStatus) => handleUpdateStatus(order.id, newStatus)}
                  >
                    {['pending', 'preparing', 'ready', 'delayed', 'cancelled', 'completed'].map((status) => (
                      <Option key={status} value={status}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {getStatusConfig(status).icon}
                          <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                        </div>
                      </Option>
                    ))}
                  </Select>

                  {order.description && (
                    <Text style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      color: '#666',
                      background: '#fff',
                      padding: '8px',
                      borderRadius: '6px',
                      marginBottom: '10px'
                    }}>
                      Note: {order.description}
                    </Text>
                  )}

                  <Text type="secondary" style={{
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <ClockCircleOutlined />
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

export default AdminOrderComponent;