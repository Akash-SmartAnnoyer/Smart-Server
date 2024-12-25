// src/components/NewOrderHistory.jsx
import React, { useState, useEffect } from 'react';
import { List, Card, Button, Popconfirm, Tag, Empty, Badge, Input, Row, Col, message } from 'antd';
import { 
  DeleteOutlined, 
  ClockCircleOutlined, 
  TableOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import { useAdminOrders } from '../context/AdminOrderContext';
import FoodLoader from './FoodLoader';

function NewOrderHistory() {
  const { orders, loading, setOrders } = useAdminOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const theme = {
    primary: '#ff4d4f',
    secondary: '#fff1f0',
    textDark: '#2d3436',
    textLight: '#636e72',
    border: '#ffe4e6',
    success: '#52c41a',
    warning: '#faad14',
    background: '#fff8f8'
  };

  // Handle mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter orders when search query changes
  useEffect(() => {
    if (orders.length) {
      const sorted = [...orders].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const filtered = sorted.filter(order => 
        (order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (order.items && order.items.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableNumber?.toString().includes(searchQuery)) ?? false
      );
      setFilteredOrders(filtered);
    }
  }, [orders, searchQuery]);

  const handleDelete = async (orderId) => {
    try {
      const deleteResponse = await fetch(
        `https://smartdb-175f4-default-rtdb.firebaseio.com/history/${orderId}.json`,
        { method: 'DELETE' }
      );

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete order. Status: ${deleteResponse.status}`);
      }

      message.success('Order deleted successfully');
      setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
      message.error('Failed to delete order. Please try again.');
    }
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: {
        color: '#ffd700',
        icon: <ClockCircleOutlined />,
        text: 'Pending'
      },
      preparing: {
        color: '#1890ff',
        icon: <ShoppingOutlined />,
        text: 'Preparing'
      },
      ready: {
        color: '#52c41a',
        icon: <CheckCircleOutlined />,
        text: 'Ready'
      },
      delayed: {
        color: '#fa8c16',
        icon: <InfoCircleOutlined />,
        text: 'Delayed'
      },
      completed: {
        color: '#52c41a',
        icon: <CheckCircleOutlined />,
        text: 'Completed'
      },
      cancelled: {
        color: '#ff4d4f',
        icon: <CloseCircleOutlined />,
        text: 'Cancelled'
      }
    };
    return statusConfig[status] || { color: '#d9d9d9', icon: <InfoCircleOutlined />, text: status };
  };

  const renderMobileView = () => (
    <div style={{ padding: '10px' }}>
      {filteredOrders.map((order) => (
        <div
          key={order.id}
          style={{
            background: 'white',
            borderRadius: '16px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(255, 77, 79, 0.08)',
            overflow: 'hidden',
            border: `1px solid ${theme.border}`
          }}
        >
          <div style={{
            background: theme.secondary,
            padding: '15px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <Row justify="space-between" align="middle">
              <Col>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: theme.primary
                  }}>
                    #{order.id}
                  </span>
                  <Tag 
                    color={getStatusInfo(order.status).color}
                    icon={getStatusInfo(order.status).icon}
                  >
                    {getStatusInfo(order.status).text}
                  </Tag>
                </div>
                <div style={{ color: theme.textLight, marginTop: '4px' }}>
                  <TableOutlined /> Table {order.tableNumber}
                </div>
              </Col>
              <Col>
                <div style={{
                  background: theme.primary,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: '600'
                }}>
                  ₹{order.total}
                </div>
              </Col>
            </Row>
          </div>

          <div style={{ padding: '15px' }}>
            {order?.items?.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: index < order.items.length - 1 ? `1px dashed ${theme.border}` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    background: theme.secondary,
                    color: theme.primary,
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}>
                    {item.quantity}
                  </div>
                  <span>{item.name}</span>
                </div>
                <span style={{ color: theme.primary, fontWeight: '600' }}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            padding: '15px',
            background: theme.secondary,
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <small style={{ color: theme.textLight }}>
              <ClockCircleOutlined style={{ marginRight: '5px' }} />
              {new Date(order.timestamp).toLocaleString()}
            </small>
            <Popconfirm
              title="Delete this order?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(order.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ 
                style: { background: theme.primary, borderColor: theme.primary }
              }}
            >
              <Button 
                type="text"
                danger
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      ))}
    </div>
  );

  useEffect(() => {
    const ws = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');
    
    ws.onopen = () => {
      console.log('WebSocket connected in OrderHistory');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'newOrder' && data.order.orgId === localStorage.getItem('orgId')) {
        setOrders(prevOrders => {
          // Check if order already exists
          if (prevOrders.some(order => order.id === data.order.id)) {
            return prevOrders;
          }
          return [data.order, ...prevOrders];
        });
      }
    };

    return () => {
      ws.close();
    };
  }, [setOrders]);

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
          Loading order history...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.background,
      minHeight: '100vh',
      paddingTop: '25px'
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(255, 77, 79, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{
          color: theme.primary,
          fontSize: isMobile ? '1.8rem' : '2.2rem',
          fontWeight: '700',
          margin: 0,
          marginTop: '12px',
          textAlign: 'center'
        }}>
          Order History
        </h1>
        <Input.Search
          placeholder="Search orders..."
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            maxWidth: '500px',
            margin: '20px auto 0',
            display: 'block'
          }}
          allowClear
        />
      </div>

      <div style={{
        maxWidth: isMobile ? '100%' : '1200px',
        margin: '0 auto',
        padding: isMobile ? '0' : '0 20px'
      }}>
        {filteredOrders.length === 0 ? (
          <Empty
            description={
              <span style={{ color: theme.textLight }}>
                {searchQuery ? 'No matching orders found' : 'No orders available'}
              </span>
            }
            style={{
              background: 'white',
              padding: '40px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.08)'
            }}
          />
        ) : (
          isMobile ? renderMobileView() : (
            <List
              grid={{
                gutter: 24,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              dataSource={filteredOrders}
              renderItem={(order) => (
                <List.Item>
                  <Badge.Ribbon 
                    text={getStatusInfo(order.status).text}
                    color={getStatusInfo(order.status).color}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: '15px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                    >
                      {/* Card content similar to mobile view */}
                      {/* ... */}
                    </Card>
                  </Badge.Ribbon>
                </List.Item>
              )}
            />
          )
        )}
      </div>
    </div>
  );
}

export { NewOrderHistory }; 