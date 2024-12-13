import React, { useState, useEffect } from 'react';
import { List, Card, Button, Popconfirm, message, Tag, Empty, Badge, Input, Row, Col, Spin } from 'antd';
import { 
  DeleteOutlined, 
  ClockCircleOutlined, 
  TableOutlined, 
  DollarOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useOrders } from '../context/OrderContext';
import FoodLoader from './FoodLoader';

function OrderHistory() {
  const { orders, loading, setOrders } = useOrders();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ordersPerPage = 10;
  const orgId = localStorage.getItem('orgId');

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

  // Slide-up animation
  const slideUpAnimation = {
    animation: 'slideUp 0.6s ease-out',
    '@keyframes slideUp': {
      '0%': { opacity: 0, transform: 'translateY(30px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    }
  };

  // Modern restaurant background with pattern
  const backgroundStyle = {
    background: `
      linear-gradient(135deg, rgba(255, 77, 79, 0.05) 0%, rgba(255, 255, 255, 0.1) 100%),
      repeating-linear-gradient(45deg, rgba(255, 77, 79, 0.02) 0px, rgba(255, 77, 79, 0.02) 2px, transparent 2px, transparent 8px)
    `,
    minHeight: '100vh',
    padding: '15px',
    fontFamily: "'Poppins', sans-serif",
    marginTop : '25px'
  };

  const handleDelete = async (orderId) => {
    try {
      const deleteResponse = await fetch(`https://smart-server-menu-database-default-rtdb.firebaseio.com/history/${orderId}.json`, {
        method: 'DELETE',
      });

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
      setFilteredOrders(filtered.slice(0, currentPage * ordersPerPage));
      setHasMore(filtered.length > currentPage * ordersPerPage);
    }
  }, [orders, searchQuery, currentPage]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    setLoadingMore(false);
  };

  // Handle mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      }
    };
    return statusConfig[status] || { color: '#d9d9d9', icon: <InfoCircleOutlined />, text: status };
  };

  const renderMobileView = () => {
    return (
      <InfiniteScroll
        dataLength={filteredOrders.length}
        next={loadMore}
        hasMore={hasMore}
        loader={
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
          </div>
        }
        endMessage={
          <div style={{ textAlign: 'center', padding: '20px', color: theme.textLight }}>
            {filteredOrders.length === 0 ? 'No orders found' : 'No more orders'}
          </div>
        }
        style={{ overflow: 'hidden' }}
      >
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
                border: `1px solid ${theme.border}`,
                animation: 'fadeIn 0.5s ease-out'
              }}
            >
              {/* Order Header */}
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
                        style={{ 
                          borderRadius: '20px',
                          padding: '0 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {getStatusInfo(order.status).icon}
                        {getStatusInfo(order.status).text}
                      </Tag>
                    </div>
                    <div style={{ 
                      color: theme.textLight,
                      fontSize: '0.9rem',
                      marginTop: '4px'
                    }}>
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

              {/* Order Items */}
              <div style={{ padding: '15px' }}>
                {order?.items?.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
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
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}>
                        {item.quantity}
                      </div>
                      <span style={{ 
                        color: theme.textDark,
                        fontWeight: '500'
                      }}>
                        {item.name}
                      </span>
                    </div>
                    <span style={{ 
                      color: theme.primary,
                      fontWeight: '600'
                    }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div style={{
                padding: '15px',
                background: theme.secondary,
                borderTop: `1px solid ${theme.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <small style={{ 
                  color: theme.textLight,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <ClockCircleOutlined />
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
                    style={{ border: 'none' }}
                  >
                    Delete
                  </Button>
                </Popconfirm>
              </div>

              {/* Status Message if exists */}
              {order.statusMessage && (
                <div style={{
                  margin: '0 15px 15px',
                  padding: '12px',
                  background: '#fff7e6',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: theme.warning,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <InfoCircleOutlined />
                  {order.statusMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    );
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
      {/* Header Section */}
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

      {/* Content Section */}
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
            <InfiniteScroll
              dataLength={filteredOrders.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin size="large" />
                </div>
              }
              style={{ overflow: 'hidden' }}
            >
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
                  <List.Item style={slideUpAnimation}>
                    <Badge.Ribbon 
                      text={getStatusInfo(order.status).text}
                      color={getStatusInfo(order.status).color}
                    >
                      <Card
                      hoverable
                        style={{
                          borderRadius: '15px',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          border: 'none',
                          background: 'white',
                        }}
                        bodyStyle={{ padding: '25px' }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '20px'
                        }}>
                          <div>
                            <h3 style={{
                              color: '#ff4d4f',
                              fontSize: '1.4rem',
                              fontWeight: '600',
                              margin: 0
                            }}>
                              #{order.id}
                            </h3>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '8px'
                            }}>
                              <TableOutlined style={{ color: '#ff4d4f' }} />
                              <span style={{ fontSize: '1.1rem' }}>Table {order.tableNumber}</span>
                            </div>
                          </div>
                          <div style={{
                            background: '#fff5f5',
                            padding: '10px 15px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <DollarOutlined style={{ color: '#ff4d4f' }} />
                            <span style={{ 
                              fontSize: '1.2rem', 
                              fontWeight: '600', 
                              color: '#ff4d4f' 
                            }}>
                              ₹{order.total}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          background: '#fafafa',
                          borderRadius: '12px',
                          padding: '15px',
                          marginBottom: '20px'
                        }}>
                          {order?.items?.map((item, index) => (
                            <div 
                              key={index}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '10px',
                                borderBottom: index < order.items.length - 1 ? '1px solid #eee' : 'none',
                                fontSize: '0.95rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ 
                                  background: '#ff4d4f',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem'
                                }}>
                                  {item.quantity}
                                </span>
                                <span>{item.name}</span>
                              </div>
                              <span style={{ fontWeight: '500' }}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}>
                            <ClockCircleOutlined />
                            {new Date(order.timestamp).toLocaleString()}
                          </div>
                          <Popconfirm
                            title="Delete this order?"
                            description="This action cannot be undone."
                            onConfirm={() => handleDelete(order.id)}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                          >
                            <Button 
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              style={{ fontSize: '16px' }}
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        </div>

                        {order.statusMessage && (
                          <div style={{
                            marginTop: '15px',
                            padding: '12px',
                            background: '#fffbe6',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: '#666',
                            border: '1px solid #ffe58f'
                          }}>
                            <InfoCircleOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                            {order.statusMessage}
                          </div>
                        )}
                      </Card>
                    </Badge.Ribbon>
                  </List.Item>
                )}
              />
            </InfiniteScroll>
          )
        )}
      </div>
    </div>
  );
}

export default OrderHistory;