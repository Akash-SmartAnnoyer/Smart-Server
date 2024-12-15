import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Typography, Divider } from 'antd';
import { ClockCircleOutlined, DollarOutlined } from '@ant-design/icons';
import FoodLoader from './FoodLoader';
import { calculateCharges } from '../utils/calculateCharges';

const { Title, Text } = Typography;

function OrderConfirmation() {
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [charges, setCharges] = useState([]);
  const { orderId } = useParams();
  const orgId = localStorage.getItem('orgId');

  useEffect(() => {
    const fetchOrderAndCharges = async () => {
      try {
        // Fetch order details
        const orderResponse = await fetch(`https://smart-server-stage-database-default-rtdb.firebaseio.com/history/${orderId}.json`);
        if (!orderResponse.ok) {
          throw new Error('Failed to fetch order status');
        }
        const order = await orderResponse.json();
        setOrderData(order);

        // Fetch charges
        const chargesResponse = await fetch(`https://smart-server-stage-database-default-rtdb.firebaseio.com/restaurants/${orgId}/charges.json`);
        const chargesData = await chargesResponse.json();
        if (chargesData) {
          const chargesArray = Object.entries(chargesData).map(([id, charge]) => ({
            id,
            ...charge
          }));
          setCharges(chargesArray);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndCharges();
    
    // Set up polling for order status updates
    const interval = setInterval(fetchOrderAndCharges, 5000);
    return () => clearInterval(interval);
  }, [orderId, orgId]);

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
          Loading order status...
        </div>
      </div>
    );
  }

  // Use stored charges from order data
  const renderChargesBreakdown = () => {
    if (!orderData?.chargesBreakdown) return null;

    return Object.entries(orderData.chargesBreakdown).map(([name, detail]) => (
      <div 
        key={name}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '5px 0',
          color: '#666'
        }}
      >
        <Text>
          {name} 
          {detail.type === 'percentage' && 
            <Text type="secondary"> ({detail.value}%)</Text>
          }
        </Text>
        <Text>₹{detail.amount.toFixed(2)}</Text>
      </div>
    ));
  };

  return (
    <Card 
      className="order-confirmation-container"
      style={{ 
        maxWidth: 800, 
        margin: '125px auto',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <Title level={2}>Order Confirmation</Title>
        <Text type="secondary">Order ID: #{orderId}</Text>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <Title level={4}>Order Status: {orderData?.status}</Title>
        <Text>{orderData?.statusMessage}</Text>
      </div>

      <Divider />

      {/* Order Items */}
      <div style={{ marginBottom: '20px' }}>
        <Title level={4}>Order Items</Title>
        {orderData?.items?.map((item, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}
          >
            <Text>{item.name} x {item.quantity}</Text>
            <Text strong>₹{(item.price * item.quantity).toFixed(2)}</Text>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div style={{ 
        backgroundColor: '#f9f9f9',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '10px',
          paddingBottom: '10px',
          borderBottom: '1px dashed #ddd'
        }}>
          <Text>Subtotal:</Text>
          <Text>₹{orderData?.subtotal?.toFixed(2)}</Text>
        </div>

        {renderChargesBreakdown()}

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          paddingTop: '10px',
          borderTop: '2px solid #ddd',
          fontWeight: 'bold'
        }}>
          <Text strong>Total Amount:</Text>
          <Text strong>₹{orderData?.total?.toFixed(2)}</Text>
        </div>
      </div>

      {/* Order Time */}
      <div style={{ textAlign: 'center', color: '#666' }}>
        <ClockCircleOutlined style={{ marginRight: '8px' }} />
        <Text type="secondary">
          Order placed at: {new Date(orderData?.timestamp).toLocaleString()}
        </Text>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: '16px',
        marginTop: '20px' 
      }}>
        <Link 
          to="/home" 
          className="order-button"
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          Order More Items
        </Link>
        <Link 
          to="/summary-view" 
          className="order-button"
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          View Bill Summary
        </Link>
      </div>
    </Card>
  );
}

export default OrderConfirmation;