import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Typography, Spin, message, notification, Button, Modal, Input, Rate, Switch, Progress, Tooltip, List, Collapse } from 'antd';
import { CheckOutlined, ClockCircleOutlined, SyncOutlined, ExclamationCircleOutlined, BellOutlined, CloseOutlined, CoffeeOutlined, SoundOutlined, CheckCircleOutlined, QuestionOutlined } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';
import { IoVolumeMuteOutline } from "react-icons/io5";
import notificationSound from './notification.mp3';
import FoodLoader from './FoodLoader';
import { useOrders } from '../context/OrderContext';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const GIF_INTERVAL = 5000; // 5 seconds per GIF

const statusGifs = {
  pending: [
    '/assets/waiting-gif-1.gif',
    '/assets/pending1-1.gif',
    '/assets/pending1-3.gif'
  ],
  preparing: [
    '/assets/preparing1.gif',
    '/assets/preparing2.gif',
    '/assets/preparing3.gif'
  ],
  ready: [
    '/assets/Taken.gif',
    '/assets/preparing-5.gif',
    '/assets/preparing-4.gif'
  ],
  completed: [
    '/assets/completed-1.gif',
    '/assets/preparing1.gif',
    '/assets/preparing2.gif',
    '/assets/preparing3.gif',
    '/assets/completed-1.gif',
  ],
  delayed: [
    '/assets/waiting-2.gif',
    '/assets/preparing2.gif',
    '/assets/taken-2.gif'
  ],
  cancelled: [
    '/assets/waiting-gif-1.gif',
    '/assets/pending1-1.gif',
    '/assets/pending1-3.gif'
  ]
};

const WaitingScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { orders, updateOrder } = useOrders();
  
  // Get order from context instead of API
  const [order, setOrder] = useState(() => orders.find(o => o.id === orderId));
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);
  const ws = useRef(null);
  const audioRef = useRef(new Audio(notificationSound));
  const [currentGifIndex, setCurrentGifIndex] = useState(0);

  useEffect(() => {
    // Only fetch if order is not in context
    if (!order) {
      const fetchOrder = async () => {
        try {
          const response = await fetch(`https://smart-server-stage-database-default-rtdb.firebaseio.com/history/${orderId}.json`);
          if (!response.ok) throw new Error('Failed to fetch order');
          const fetchedOrder = await response.json();
          if (!fetchedOrder) throw new Error('Order not found');
          setOrder({ ...fetchedOrder, displayOrderId: fetchedOrder.id || orderId });
        } catch (error) {
          console.error('Failed to fetch order', error);
          message.error('Failed to fetch order');
        }
      };
      fetchOrder();
    }
    
    // WebSocket setup
    ws.current = new WebSocket('wss://legend-sulfuric-ruby.glitch.me');

    ws.current.onopen = () => {
      const orgId = localStorage.getItem('orgId');
      ws.current.send(JSON.stringify({ type: 'subscribe', orgId }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'statusUpdate' && data.orderId === orderId) {
        setOrder(prevOrder => ({ ...prevOrder, status: data.status.toLowerCase().trim(), statusMessage: data.statusMessage }));
        
        if (soundEnabled) {
          audioRef.current.play().catch(error => console.error('Error playing audio:', error));
        }

        notification.open({
          message: 'Order Status Updated',
          description: `Your order status has been updated to: ${data.status}`,
          icon: <BellOutlined style={{ color: '#1890ff' }} />,
          duration: 4.5,
        });
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [orderId, soundEnabled, order]);

  // Replace the existing useEffect for GIF rotation with:
  useEffect(() => {
    if (order?.status) {
      const interval = setInterval(() => {
        setCurrentGifIndex(prevIndex => {
          const currentStatusGifs = statusGifs[order.status] || [];
          return (prevIndex + 1) % currentStatusGifs.length;
        });
      }, GIF_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [order?.status]);

  // Show loading only if no order data is available
  if (!order) {
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
          Loading order details...
        </div>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    setConfirmCancelVisible(true);
  };

  const handleConfirmCancelOrder = async () => {
    setConfirmCancelVisible(false);
    try {
      const success = await updateOrder(orderId, {
        status: 'cancelled',
        statusMessage: 'Your order has been cancelled'
      });

      if (success) {
        clearCart();
        setCancelModalVisible(true);
      } else {
        throw new Error('Failed to cancel the order');
      }
    } catch (error) {
      console.error('Failed to cancel the order', error);
      message.error('Failed to cancel the order. Please try again.');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const success = await updateOrder(orderId, {
        status: 'completed',
        statusMessage: 'Your order has been completed'
      });

      if (success) {
        clearCart();
        setIsModalVisible(true);
      } else {
        throw new Error('Failed to complete the order');
      }
    } catch (error) {
      console.error('Failed to complete the order', error);
      message.error('Failed to complete the order. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ fontSize: '48px', color: '#faad14' }} />;
      case 'preparing':
        return <SyncOutlined spin style={{ fontSize: '48px', color: '#1890ff' }} />;
      case 'ready':
        return <CheckOutlined style={{ fontSize: '48px', color: '#52c41a' }} />;
      case 'delayed':
        return <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />;
      case 'completed':
        return <CheckOutlined style={{ fontSize: '48px', color: '#52c41a' }} />;
      case 'cancelled' :
        return <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />;
      default:
        console.warn(`Unknown status: ${status}`);
        return <QuestionOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />;
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'pending': return 25;
      case 'preparing': return 50;
      case 'ready': return 100;
      case 'completed': return 100;
      case 'delayed': return 75;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      message.warning('Please provide your feedback before submitting.');
      return;
    }

    const feedbackDetails = {
      orderId: orderId,
      feedback,
      rating,
    };
  
    try {
      const response = await fetch('https://smart-server-stage-database-default-rtdb.firebaseio.com/feedback.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackDetails),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }
  
      message.success('Thank you for your feedback!');
      setIsModalVisible(false);
      navigate('/home'); // Redirect after submission
    } catch (error) {
      console.error('Failed to save feedback', error);
      message.error('Failed to submit feedback. Please try again.');
    }
  }
  const handleCancelModalClose = () => {
    setCancelModalVisible(false);
    navigate(`/home/`);
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'flex-start', 
      alignItems: 'center', 
      padding: '20px', 
      minHeight: 'calc(100vh - 140px)', // Subtract header (70px) and footer (70px) height
      backgroundColor: '#f8f9fa', 
      paddingTop: "170px",    // Increased padding top to ensure content is visible
      marginBottom: "70px",  // Match footer height
      paddingBottom: '20px'
    }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <Switch
          checkedChildren={<SoundOutlined />}
          unCheckedChildren={<IoVolumeMuteOutline />}
          checked={soundEnabled}
          onChange={setSoundEnabled}
          style={{ backgroundColor: soundEnabled ? '#52c41a' : '#ff4d4f', borderColor: soundEnabled ? '#52c41a' : '#ff4d4f' }}
        />
        <Text style={{ marginLeft: '8px', color: '#343a40' }}>Sound Notifications</Text>
      </div>
      
      <Card
  className="status-card"
  style={{
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    borderRadius: '16px',
    border: '1px solid #e9ecef',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    background: '#fff',
    transition: 'transform 0.3s ease',
  }}
>
  <Title level={3} style={{ color: '#343a40' }}>Order #{order.displayOrderId}</Title>

  {/* Order Details Section with scroll */}
  <Collapse 
    style={{ 
      marginBottom: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: 'none'
    }}
  >
    <Panel 
      header={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: '#343a40',
          fontWeight: 'bold'
        }}>
          <span>Order Details</span>
          <span style={{ color: '#ff4d4f', fontSize: '14px' }}>
            ₹ {order.total?.toFixed(2) || '0.00'}
          </span>
        </div>
      } 
      key="1"
      style={{ backgroundColor: '#f8f9fa', border: 'none' }}
    >
      <div style={{ 
        maxHeight: '200px',
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: '#ff4d4f #f8f9fa',
      }}>
        <List
          size="small"
          dataSource={order.items || []}
          renderItem={item => (
            <List.Item style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <Text>{item.quantity}x {item.name}</Text>
                <Text strong>
                  ₹ {(item.price * item.quantity).toFixed(2)}
                </Text>
              </div>
            </List.Item>
          )}
          footer={
            <div style={{ 
              borderTop: '1px solid #e8e8e8',
              marginTop: '12px',
              paddingTop: '12px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#f8f9fa',
              padding: '12px 0'
            }}>
              <Text strong>Total (incl. charges):</Text>
              <Text strong style={{ color: '#ff4d4f' }}>
                ₹ {order.total?.toFixed(2) || '0.00'}
              </Text>
            </div>
          }
        />
      </div>
    </Panel>
  </Collapse>

  {/* Add custom scrollbar styles */}
  <style>
    {`
      .ant-collapse {
        background: #f8f9fa !important;
      }
      .ant-collapse-header {
        background: #f8f9fa !important;
        border-radius: 8px !important;
      }
      .ant-collapse-content {
        background: #f8f9fa !important;
      }
      .ant-collapse-item {
        border: none !important;
      }
      div::-webkit-scrollbar {
        width: 6px;
      }
      div::-webkit-scrollbar-track {
        background: #f8f9fa;
        border-radius: 3px;
      }
      div::-webkit-scrollbar-thumb {
        background: #ff4d4f;
        border-radius: 3px;
      }
      div::-webkit-scrollbar-thumb:hover {
        background: #ff7875;
      }
    `}
  </style>

  {/* GIF Display Section */}
  <div style={{ 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    borderRadius: '12px',
    marginLeft: '80px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: '100px',
    width: '100px',
    maxWidth: '100%',
    backgroundColor: '#f8f9fa',
  }}>
    {order?.status && statusGifs[order.status] && (
      <img 
        src={statusGifs[order.status][currentGifIndex]}
        alt={`Order ${order.status} animation`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    )}
  </div>

  <Progress
    type="circle"
    percent={getStatusProgress(order.status)}
    format={() => getStatusIcon(order.status)}
    width={80}
    strokeColor={{
      '0%': '#ff4d4f',
      '100%': '#52c41a',
    }}
    trailColor="#f0f0f0"
  />
  
  <Title level={4} style={{ marginTop: '16px', color: '#343a40' }}>{order.statusMessage}</Title>
  <Text type="secondary" style={{ color: '#6c757d' }}>We'll notify you when your order status changes</Text>
  
  <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
    <Tooltip title="Cancel your order" placement="bottom">
      <Button
        icon={<CloseOutlined />}
        onClick={handleCancelOrder}
        type="default"
        disabled={order.status !== 'pending' && order.status !== 'preparing'}
        style={{ backgroundColor: '#f8f9fa', color: '#ff4d4f', borderColor: '#e9ecef', fontWeight: 'bold' }}
      >
        Cancel
      </Button>
    </Tooltip>
    <Tooltip title="Complete your order" placement="bottom">
      <Button
        icon={<CheckOutlined />}
        onClick={handleCompleteOrder}
        type="primary"
        disabled={order.status !== 'ready'}
        style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f', fontWeight: 'bold' }}
      >
        Complete
      </Button>
    </Tooltip>
  </div>
</Card>


      {/* Keep all existing modals */}
      <Modal
        title="Thank You!"
        visible={isModalVisible}
        onOk={handleSubmitFeedback}
        onCancel={() => setIsModalVisible(false)}
        okText="Submit Feedback"
        cancelText="Later"
        footer={[
          <Button key="submit" type="primary" onClick={handleSubmitFeedback} style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}>
            Submit Feedback
          </Button>,
          <Button key="cancel" onClick={() =>{ setIsModalVisible(false);       navigate('/home'); // Redirect after submission
          } }>
            Later
          </Button>,
        ]}
        centered
        bodyStyle={{ backgroundColor: '#f6ffed', color: '#ff4d4f', textAlign: 'center' }}
      >
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
          <CoffeeOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
        </div>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Thank you for dining with us!</p>
        <p>We hope you enjoyed your meal. Please provide your feedback below:</p>
        <Input.TextArea
          placeholder="Leave your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          style={{ marginBottom: '10px' }}
        />
        <Rate
          allowHalf
          value={rating}
          onChange={(value) => setRating(value)}
          style={{ marginBottom: '10px' }}
        />
      </Modal>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
            <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
            Confirm Cancellation
          </div>
        }
        visible={confirmCancelVisible}
        onOk={handleConfirmCancelOrder}
        onCancel={() => setConfirmCancelVisible(false)}
        centered
        footer={[
          <Button key="cancel" onClick={() => setConfirmCancelVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            onClick={handleConfirmCancelOrder}
            style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
          >
            Confirm
          </Button>,
        ]}
        bodyStyle={{ backgroundColor: '#fff5f5', color: '#ff4d4f', textAlign: 'center' }}
      >
        <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
          Are you sure you want to cancel your order?
        </p>
      </Modal>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', color: '#ff4d4f' }}>
            <CheckCircleOutlined style={{ marginRight: '8px' }} />
            Cancellation Confirmation
          </div>
        }
        visible={cancelModalVisible}
        onOk={handleCancelModalClose}
        onCancel={handleCancelModalClose}
        footer={null}
        centered
        closable={false}
        style={{ backdropFilter: 'blur(5px)' }}
      >
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
          <Title level={4} style={{ marginTop: '16px' }}>Cancelled successfully</Title>
          <Text>Your order has been cancelled successfully.</Text>
          <div style={{ marginTop: '20px' }}>
            <Button 
              type="primary" 
              onClick={handleCancelModalClose}
              style={{ backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }}
            >
              Go to Home
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WaitingScreen;