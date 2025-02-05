// src/components/NewAdminPage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Tag, Select, Typography, message, Empty, Badge, Input, Switch, Button, Dropdown } from 'antd';
import {
  CheckOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  SoundOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  TableOutlined,
  EditOutlined,
  MessageOutlined,
  TagsOutlined,
  BellFilled
} from '@ant-design/icons';
import { useAdminOrders } from '../context/AdminOrderContext';
import FoodLoader from './FoodLoader';
import notificationSound from './notification.mp3';
import { NotebookPen } from 'lucide-react';

const { Option } = Select;
const { Text } = Typography;

const NewAdminPage = () => {
  const { orders, loading, updateOrder, setOrders, fetchOrders, hasMore } = useAdminOrders();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    // Initialize soundEnabled from localStorage
    const savedSoundSetting = localStorage.getItem('soundEnabled');
    return savedSoundSetting ? JSON.parse(savedSoundSetting) : false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrders, setNewOrders] = useState([]);
  const [customerIdMap, setCustomerIdMap] = useState({});
  const audioRef = useRef(new Audio(notificationSound));
  const ws = useRef(null);
  const orgId = localStorage.getItem('orgId');
  const [lastOrderTimestamp, setLastOrderTimestamp] = useState(null);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const loadingRef = useRef(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  // Map customer IDs to sequential numbers
  useEffect(() => {
    const uniqueCustomerIds = [...new Set(orders.map(order => order.customerId))];
    const map = uniqueCustomerIds.reduce((acc, id, index) => {
      acc[id] = index + 1;
      return acc;
    }, {});
    setCustomerIdMap(map);
  }, [orders]);

  // Update localStorage whenever soundEnabled changes
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Add this function to filter orders by date
  const filterOrdersByDate = (orders) => {
    if (!showTodayOnly) return orders;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= today;
    });
  };

  // Update the filteredOrders logic
  const filteredOrders = filterOrdersByDate(orders).filter(order => 
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
      ws.current = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');
      ws.current.onopen = () => {
        console.log('WebSocket connected');
      };
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'newOrder' && data.order.orgId === orgId) {
          setOrders(prevOrders => {
            if (prevOrders.some(order => order.id === data.order.id)) {
              return prevOrders;
            }
            return [data.order, ...prevOrders];
          });
          setNewOrders(prev => [...prev, data.order.id]);
          
          if (soundEnabled) {
            playNotificationSound();
          }

          message.success({
            content: `New order #${data.order.id} from Table ${data.order.tableNumber}`,
            icon: <BellOutlined style={{ color: '#ff4d4f' }} />
          });
        } else if (data.type === 'statusUpdate' && data.orgId === orgId) {
          // Only show notification and update state if the update is from another client
          if (data.senderId !== ws.current.id) {
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
        } else if (data.type === 'statusUpdate' && data.status === 'cancelled') {
          // Add to cancelled orders list
          setCancelledOrders(prev => {
            const order = orders.find(o => o.id === data.orderId);
            if (order && !prev.some(o => o.id === order.id)) {
              return [{ ...order, timestamp: new Date().toISOString() }, ...prev];
            }
            return prev;
          });
          // Play notification sound
          playNotificationSound();
        }
      };

      // Assign a unique ID to this WebSocket connection
      ws.current.id = Math.random().toString(36).substr(2, 9);

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
        statusMessage,
        updatedAt: new Date().toISOString()
      });

      if (success) {
        // Update local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId 
              ? { ...order, status: newStatus, statusMessage }
              : order
          )
        );

        // Send WebSocket message for other clients
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'statusUpdate',
            orderId,
            status: newStatus,
            statusMessage,
            orgId,
            senderId: ws.current.id
          }));
        }

        setNewOrders(prev => prev.filter(id => id !== orderId));
        
        message.success('Order status updated successfully');
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      message.error('Failed to update order status: ' + error.message);
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

  const getTagLabel = (tagId) => {
    const tagMap = {
      1: 'Extra Spicy',
      2: 'Less Spicy',
      3: 'Double Spicy',
      4: 'Non Spicy',
      5: 'No Onion',
      6: 'No Garlic',
      7: 'Gluten-free',
      8: 'Dairy-free'
    };
    return tagMap[tagId] || 'Unknown';
  };

  const getTagColor = (tagId) => {
    // Spice-related tags (1-4)
    if (tagId >= 1 && tagId <= 4) return '#f50';
    // Dietary preferences (5-8)
    return '#108ee9';
  };

  // Update loadMoreOrders to check hasMore
  const loadMoreOrders = useCallback(() => {
    if (!loadingRef.current && hasMore) { // Check hasMore before loading
      const lastOrder = orders[orders.length - 1];
      if (lastOrder) {
        loadingRef.current = true;
        fetchOrders(lastOrder.timestamp).finally(() => {
          loadingRef.current = false;
        });
      }
    }
  }, [orders, fetchOrders, hasMore]);

  // Add infinite scroll effect
  useEffect(() => {
    const handleScroll = debounce(() => {
      // Check if we're near the bottom (within 200px)
      if (
        window.innerHeight + window.pageYOffset >= 
        document.documentElement.scrollHeight - 200
      ) {
        loadMoreOrders();
      }
    }, 200); // Debounce scroll events

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel(); // Cancel any pending debounce
    };
  }, [loadMoreOrders]);

  // Helper function to debounce scroll events
  function debounce(func, wait) {
    let timeout;
    const debouncedFunction = function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
    debouncedFunction.cancel = () => clearTimeout(timeout);
    return debouncedFunction;
  }

  useEffect(() => {
    // Check if page needs refresh
    const needRefresh = localStorage.getItem('needRefresh');
    if (needRefresh !== 'no') {
      // Set flag to 'no' before refreshing to prevent refresh loop
      localStorage.setItem('needRefresh', 'no');
      window.location.reload();
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Get pending orders count
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const pendingOrdersCount = pendingOrders.length;

  // Add this function to filter notifications by date
  const filterNotificationsByDate = (orders) => {
    if (!showTodayOnly) return orders;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= today;
    });
  };

  // Get filtered pending orders count
  const filteredPendingOrders = filterNotificationsByDate(pendingOrders);
  const filteredCancelledOrders = filterNotificationsByDate(cancelledOrders);

  // Update the notificationItems to use filtered orders
  const notificationItems = {
    items: [
      // Pending orders section
      ...(filteredPendingOrders.length > 0 ? [{
        key: 'pending-header',
        label: (
          <div style={{ padding: '8px', backgroundColor: '#fff7e6', fontWeight: 'bold' }}>
            Pending Orders
          </div>
        ),
        disabled: true
      },
      ...filteredPendingOrders.map(order => ({
        key: order.id,
        label: (
          <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
            <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
              Order #{order.id} - Table {order.tableNumber}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {new Date(order.timestamp).toLocaleString()}
            </div>
          </div>
        ),
        onClick: () => handleOrderClick(order.id)
      }))] : []),
      
      // Cancelled orders section
      ...(filteredCancelledOrders.length > 0 ? [{
        key: 'cancelled-header',
        label: (
          <div style={{ padding: '8px', backgroundColor: '#fff1f0', fontWeight: 'bold' }}>
            Recently Cancelled Orders
          </div>
        ),
        disabled: true
      },
      ...filteredCancelledOrders.map(order => ({
        key: `cancelled-${order.id}`,
        label: (
          <div style={{ padding: '8px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
            <div style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
              Order #{order.id} - Table {order.tableNumber}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Cancelled at {new Date(order.timestamp).toLocaleString()}
            </div>
          </div>
        ),
        onClick: () => handleOrderClick(order.id)
      }))] : [])
    ]
  };

  // Add handleOrderClick function
  const handleOrderClick = (orderId) => {
    // Find the order in the list and scroll to it
    const orderElement = document.getElementById(`order-${orderId}`);
    if (orderElement) {
      orderElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the order card briefly
      orderElement.style.backgroundColor = '#fff3f0';
      setTimeout(() => {
        orderElement.style.backgroundColor = '';
      }, 2000);
    }

    // Remove from notifications if it's a cancelled order
    setCancelledOrders(prev => prev.filter(order => order.id !== orderId));
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
          
          {/* Add the new toggle switch section */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '15px',
            margin: '15px 0',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: '#fff5f5',
              padding: '4px',
              borderRadius: '30px',
              display: 'inline-flex',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Button
                type={showTodayOnly ? 'primary' : 'text'}
                onClick={() => setShowTodayOnly(true)}
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  background: showTodayOnly ? '#ff4d4f' : 'transparent',
                  color: showTodayOnly ? 'white' : '#666',
                  padding: '4px 15px'
                }}
              >
                Today
              </Button>
              <Button
                type={!showTodayOnly ? 'primary' : 'text'}
                onClick={() => setShowTodayOnly(false)}
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  background: !showTodayOnly ? '#ff4d4f' : 'transparent',
                  color: !showTodayOnly ? 'white' : '#666',
                  padding: '4px 15px'
                }}
              >
                All Orders
              </Button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#fff5f5',
              padding: '8px 15px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Switch
                checkedChildren={<SoundOutlined />}
                unCheckedChildren={<SoundOutlined />}
                checked={soundEnabled}
                onChange={setSoundEnabled}
                style={{ 
                  backgroundColor: soundEnabled ? '#ff4d4f' : undefined,
                  minWidth: '40px'
                }}
              />
              <Text>Sound Alerts</Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '15px'
          }}>
            <Input.Search
              placeholder="Search orders by ID, items, status, or table number..."
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                maxWidth: '500px', 
                flex: 1,
                borderRadius: '30px'
              }}
              allowClear
            />
          </div>

          {/* Add order count display */}
          <div style={{
            marginTop: '15px',
            color: '#666',
            fontSize: '0.9rem'
          }}>
            Showing {filteredOrders.length} {showTodayOnly ? "today's" : 'total'} orders
          </div>
        </div>

        {/* Add notification bell */}
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '15px',
          zIndex: 1000
        }}>
          <Dropdown
            menu={notificationItems}
            placement="bottomRight"
            trigger={['click']}
            overlayStyle={{
              maxHeight: '400px',
              overflowY: 'auto',
              width: '300px'
            }}
          >
            <Badge 
              count={filteredPendingOrders.length + filteredCancelledOrders.length} 
              offset={[-5, 5]}
            >
              <BellFilled 
                style={{ 
                  fontSize: '24px', 
                  color: filteredCancelledOrders.length > 0 ? '#ff4d4f' : '#ff4d4f',
                  padding: '8px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  cursor: 'pointer',
                  animation: filteredCancelledOrders.length > 0 ? 'shake 0.5s ease-in-out infinite' : 'none'
                }} 
              />
            </Badge>
          </Dropdown>
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
                  id={`order-${order.id}`}
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
                        Customer {customerIdMap[order.customerId]}
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
                      <Text strong style={{ color: '#ff4d4f' }}>
                        ₹{parseFloat(order.total).toFixed(2)}
                      </Text>
                    </div>
                  </div>
                  {order.description && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px'
                    }}>
                      <NotebookPen />
                      <Text>
                        {order.description}
                      </Text>
                    </div>
                  )}

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '10px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    {order?.items?.map((item, index) => (
                      <div key={index} style={{
                        background: '#fff',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <div style={{
                            background: '#ff4d4f',
                            color: 'white',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {item.quantity}
                          </div>
                          <Text strong style={{ flex: 1 }}>{item.name}</Text>
                          {item.specialInstructions && (
                            <Tag color="#722ed1" style={{ margin: 0 }}>
                              <EditOutlined /> Custom
                            </Tag>
                          )}
                        </div>
                        
                        {(item.specialInstructions || item.selectedTags?.length > 0) && (
                          <div style={{
                            fontSize: '0.9rem',
                            color: '#666',
                            background: '#f8f8f8',
                            padding: '10px',
                            borderRadius: '8px',
                            marginTop: '8px'
                          }}>
                            {item.specialInstructions && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'flex-start',
                                gap: '6px',
                                marginBottom: item.selectedTags?.length > 0 ? '8px' : 0
                              }}>
                                <MessageOutlined style={{ 
                                  color: '#722ed1',
                                  marginTop: '3px'
                                }} />
                                <Text type="secondary" style={{ flex: 1 }}>
                                  {item.specialInstructions}
                                </Text>
                              </div>
                            )}
                            
                            {item.selectedTags?.length > 0 && (
                              <div style={{ 
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '6px'
                              }}>
                                <TagsOutlined style={{ 
                                  color: '#108ee9',
                                  marginTop: '3px'
                                }} />
                                <div style={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  gap: '4px',
                                  flex: 1
                                }}>
                                  {item.selectedTags.map((tagId) => (
                                    <Tag 
                                      key={tagId} 
                                      color={getTagColor(tagId)}
                                      style={{ 
                                        margin: 0,
                                        padding: '2px 8px',
                                        fontSize: '0.8rem'
                                      }}
                                    >
                                      {getTagLabel(tagId)}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
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

        {/* Update bottom indicators */}
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#666'
          }}>
            Loading more orders...
          </div>
        )}
        
        {!loading && !hasMore && orders.length > 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '20px',
            color: '#666',
            borderTop: '1px solid #f0f0f0',
            marginTop: '20px'
          }}>
            No more orders to load
          </div>
        )}
      </div>
      <style>
        {`
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            50% { transform: translateX(3px); }
            75% { transform: translateX(-3px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

export default NewAdminPage;