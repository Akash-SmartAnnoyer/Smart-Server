import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Tag, Space, Button, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ClockCircleOutlined, 
  SyncOutlined, 
  CheckOutlined, 
  ExclamationCircleOutlined,
  ShopOutlined 
} from '@ant-design/icons';
import FoodLoader from './FoodLoader';
import { useAdminOrders } from '../context/AdminOrderContext';

const { Title, Text } = Typography;

const MyOrders = () => {
  const { orders, loading } = useAdminOrders();
  const navigate = useNavigate();
  const [ws, setWs] = useState(null);
  const tableNumber = localStorage.getItem('tableNumber');

  // WebSocket connection setup
  useEffect(() => {
    const websocket = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');

    websocket.onopen = () => {
      console.log('WebSocket connected in MyOrders');
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle new orders
      if (data.type === 'newOrder' && data.order.tableNumber === tableNumber) {
        // The AdminOrderContext will handle adding the new order to the orders array
        console.log('New order received:', data.order);
      }
      
      // Handle status updates
      if (data.type === 'statusUpdate' && orders.some(order => 
        order.id === data.orderId && order.tableNumber === tableNumber
      )) {
        console.log('Status update received:', data);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        setWs(new WebSocket('wss://legend-sulfuric-ruby.glitch.me'));
      }, 3000);
    };

    setWs(websocket);

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [tableNumber]);

  // Filter active orders for the current table
  const activeOrders = orders.filter(order => 
    !['cancelled', 'completed'].includes(order.status) && 
    order.tableNumber === tableNumber
  );

  const handleViewDetails = (order) => {
    navigate(`/waiting/${order.id}`, { 
      state: { orderDetails: order }
    });
  };

  // Main styles object
  const styles = {
    container: {
      padding: '16px',
      maxWidth: '100%',
      background: 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)',
      minHeight: '100vh',
      marginTop : "100px"
    },
    header: {
      textAlign: 'center',
      marginBottom: '24px',
      position: 'relative',
      padding: '20px 0',
      borderBottom: '2px solid #ffeded',
    },
    headerTitle: {
      color: 'red',
      fontSize: '28px',
      fontWeight: 'bold',
      margin: 0,
      fontFamily: "'Playfair Display', serif",
    },
    headerIcon: {
      fontSize: '24px',
      color: 'red',
      marginRight: '8px',
    },
    card: {
      borderRadius: '12px',
      marginBottom: '16px',
      border: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      background: '#ffffff',
    },
    orderNumber: {
      color: 'red',
      margin: '0',
      fontSize: '20px',
      fontWeight: '600',
    },
    statusContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '8px',
    },
    statusMessage: {
      color: '#666',
      fontSize: '14px',
      marginTop: '8px',
    },
    tableNumber: {
      background: '#fff5f5',
      padding: '8px 12px',
      borderRadius: '8px',
      color: 'red',
      fontSize: '14px',
      fontWeight: '500',
    },
    viewButton: {
      width: '100%',
      height: '40px',
      backgroundColor: 'red',
      borderColor: 'red',
      borderRadius: '8px',
      fontWeight: '500',
      marginTop: '12px',
      boxShadow: '0 2px 4px rgba(220,53,69,0.2)',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      marginTop: '275px'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
    },
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'preparing': return <SyncOutlined spin style={{ color: '#1890ff' }} />;
      case 'ready': return <CheckOutlined style={{ color: '#52c41a' }} />;
      case 'delayed': return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'completed': return <CheckOutlined style={{ color: '#52c41a' }} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#faad14';
      case 'preparing': return '#1890ff';
      case 'ready': return '#52c41a';
      case 'delayed': return '#ff4d4f';
      case 'completed': return '#52c41a';
      default: return '#d9d9d9';
    }
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
    <div style={styles.container}>
      <div style={styles.header}>
        <Space align="center">
          <ShopOutlined style={styles.headerIcon} />
          <Title level={2} style={styles.headerTitle}>My Orders</Title>
        </Space>
      </div>

      <List
        dataSource={activeOrders}
        locale={{ 
          emptyText: (
            <div style={styles.emptyState}>
              <ShopOutlined style={{ fontSize: '48px', color: 'red', marginBottom: '16px' }} />
              <p>No active orders found for your table</p>
            </div>
          ) 
        }}
        renderItem={(order) => (
          <List.Item style={{ padding: 0, marginBottom: '16px' }}>
            <Card style={styles.card} bodyStyle={{ padding: '16px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div style={styles.statusContainer}>
                  <Title level={4} style={styles.orderNumber}>Order #{order.id}</Title>
                  <Tag 
                    style={{
                      borderRadius: '16px',
                      padding: '4px 12px',
                      border: 'none',
                      backgroundColor: `${getStatusColor(order.status)}20`,
                      color: getStatusColor(order.status),
                    }}
                  >
                    {getStatusIcon(order.status)}
                    <span style={{ marginLeft: '4px' }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </Tag>
                </div>
                
                <Text style={styles.statusMessage}>{order.statusMessage}</Text>
                
                <div style={styles.tableNumber}>
                  <span>Table {order.tableNumber}</span>
                </div>

                <Button 
                  onClick={() => handleViewDetails(order)}
                  type="primary"
                  style={styles.viewButton}
                >
                  View Details
                </Button>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MyOrders;