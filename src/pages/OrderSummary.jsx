import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Checkbox, Input, Typography, message, Card, Alert } from 'antd';
import { CoffeeOutlined, SmileOutlined,ExclamationCircleOutlined, PlusCircleOutlined, CheckOutlined, ShoppingCartOutlined, GifOutlined, ThunderboltFilled } from '@ant-design/icons';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import './OrderSummary.css'; // Assuming you're using CSS modules or a custom CSS file
import FoodLoader from '../components/FoodLoader';
import { calculateCharges } from '../utils/calculateCharges';
import { useOrders } from '../context/OrderContext';
import { MapPin } from 'lucide-react';
const { Text, Title } = Typography;

const MAX_DISTANCE_KM = 0.5; // Maximum allowed distance in kilometers

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

function OrderSummary() {
  const { cart } = useCart();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [showBubble, setShowBubble] = useState(true);
  const [animationClass, setAnimationClass] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [seatingCapacity, setSeatingCapacity] = useState(0);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [description, setDescription] = useState('');
  const ws = useRef(null);
  const [charges, setCharges] = useState([]);
  const [chargesLoading, setChargesLoading] = useState(true);
  const { restaurantDetails, charges: contextCharges, addOrder } = useOrders();
  const [locationError, setLocationError] = useState(null);

  // Add WebSocket connection setup
useEffect(() => {
ws.current = new WebSocket('wss://smart-menu-web-socket-server.onrender.com');
  ws.current.onopen = () => {
    console.log('WebSocket connected in OrderSummary');
  };

  return () => {
    if (ws.current) {
      ws.current.close();
    }
  };
}, []);
  useEffect(() => {
    const fetchSeatingCapacity = async () => {
      try {
        const orgId = localStorage.getItem('orgId');
        if (!orgId) {
          console.error('No orgId found in localStorage');
          return;
        }
    
        const response = await fetch('https://production-db-993e8-default-rtdb.firebaseio.com/restaurants.json'); // Add .json
        if (!response.ok) {
          throw new Error('Failed to fetch restaurant data');
        }
    
        const restaurants = await response.json();
    
        // Convert Firebase data object into an array
        const restaurantsArray = Object.values(restaurants);
        const restaurant = restaurantsArray.find(r => r.orgId === orgId);
    
        if (restaurant) {
          setSeatingCapacity(parseInt(restaurant.seatingCapacity, 10)); // Parse seating capacity as integer
        } else {
          console.error('No restaurant found for the given orgId');
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      }
    };
    

    // Check if a tableNumber is already in localStorage
    const savedTableNumber = localStorage.getItem('tableNumber');
    if (savedTableNumber) {
      setTableNumber(savedTableNumber); // Set the table number from localStorage
    }

    fetchSeatingCapacity();
  }, []);
  useEffect(() => {
    // Suggested items list
    setSuggestedItems([
      { name: 'Regular Water', image: 'data:image/jpeg;base64,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', quote: 'Stay hydrated!' },
      { name: 'Lemon', image: 'data:image/jpeg;base64,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', quote: 'Add a zesty touch!' },
      { name: 'Onions', image: 'https://cdn3.didevelop.com/public/cdn/533_85eeabd966a7facca7863150dea6c11a.jpg', quote: 'Enhance the flavor!' },
    ]);

    // Animation for the bubble
    const interval = setInterval(() => {
      setAnimationClass((prev) => (prev === '' ? 'bubble-animation' : ''));
    }, 1000); // Toggle animation every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchCharges = async () => {
      try {
        const orgId = localStorage.getItem('orgId');
        const response = await fetch(`https://production-db-993e8-default-rtdb.firebaseio.com/restaurants/${orgId}/charges.json`);
        const data = await response.json();
        if (data) {
          const chargesArray = Object.entries(data).map(([id, charge]) => ({
            id,
            ...charge
          }));
          setCharges(chargesArray);
        }
      } catch (error) {
        console.error('Error fetching charges:', error);
        message.error('Failed to fetch charges');
      } finally {
        setChargesLoading(false); // Set loading to false after fetching
      }
    };

    fetchCharges();
  }, []);

  // Calculate totals with charges
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const enabledCharges = charges.filter(charge => charge.isEnabled);
  const { total: calculatedTotal, breakdown } = calculateCharges(subtotal, enabledCharges);

  const handleTableNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTableNumber(value);
      localStorage.setItem('tableNumber', value); // Save to localStorage
    }
  };

  const generateOrderId = () => {
    // Get the current date in YYYYMMDD format
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    // Generate a random 4-digit number
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    // Combine to form the order ID
    return `ORD-${date}-${randomDigits}`;
  };

  // Add verifyLocation function
  const verifyLocation = async () => {
    try {
      const orgId = localStorage.getItem('orgId');
      const response = await fetch('https://production-db-993e8-default-rtdb.firebaseio.com/restaurants.json');
      if (!response.ok) throw new Error('Failed to fetch restaurant data');

      const data = await response.json();
      const restaurantArray = Object.values(data);
      const restaurantData = restaurantArray.find(r => r.orgId === orgId);

      if (!restaurantData || !restaurantData.position) {
        throw new Error('Restaurant location data not found');
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;
      const restaurantLat = restaurantData.position[0];
      const restaurantLon = restaurantData.position[1];

      const distance = calculateDistance(
        userLat, userLon,
        restaurantLat, restaurantLon
      );

      if (distance > MAX_DISTANCE_KM) {
        setLocationError(`You appear to be ${distance.toFixed(2)}km away from the restaurant. Please place your order when you're at the restaurant.`);
        return false;
      }
      return true;
    } catch (err) {
      setLocationError("Unable to verify your location. Please enable location services and try again.");
      return false;
    }
  };

  // Modify handlePayClick to include location verification
  const handlePayClick = async () => {
    try {
      setLoading(true);
      
      // Verify location before proceeding
      const isLocationValid = await verifyLocation();
      if (!isLocationValid) {
        setLoading(false);
        return;
      }

      const orderId = generateOrderId();
      
      const orderDetails = {
        id: orderId,
        orgId: localStorage.getItem('orgId'),
        items: cart,
        subtotal,
        charges: enabledCharges,
        chargesBreakdown: breakdown,
        total: calculatedTotal,
        tableNumber,
        customerId:localStorage.getItem('customerId'),
        timestamp: new Date().toISOString(),
        status: 'pending',
        statusMessage: 'Your order is being processed',
        description,
        displayOrderId: orderId
      };

      // Add to context first for immediate UI update
      addOrder(orderDetails);

      // Send WebSocket notification before navigation
      if (ws.current?.readyState === WebSocket.OPEN) {
        await new Promise((resolve) => {
          ws.current.send(JSON.stringify({ 
            type: 'newOrder', 
            order: orderDetails 
          }));
          resolve();
        });
      }

      // Save to Firebase
      const orderResponse = await fetch(`https://production-db-993e8-default-rtdb.firebaseio.com/history/${orderId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderDetails),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to save order');
      }

      clearCart();
      navigate(`/waiting/${orderId}`);

    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const handleSubmitFeedback = async () => {
    // ... (feedback submission logic remains unchanged)
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
          Processing your order...
        </div>
      </div>
    );
  }

  // Add location error modal
  if (locationError) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <Card style={{
          width: '90%',
          maxWidth: '450px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(255, 77, 77, 0.15)',
          border: 'none'
        }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <Alert
              message="Location Verification Failed"
              description={locationError}
              type="error"
              showIcon
            />
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#666',
              fontSize: '14px'
            }}>
              <MapPin size={16} />
              <Text>Please scan the QR code when you're at the restaurant</Text>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleBubbleClick = () => {
    setIsModalVisible(true);
    // setShowBubble(false); // Hide the bubble once clicked
  };

  const handleAddSuggestion = (item) => {
    console.log(`Added ${item.name} to the order.`);
    setIsModalVisible(false);
  };

  if (loading) {
    return <FoodLoader />;
  }

  return (
    <div className="order-summary-container" style={{ 
      marginTop: '145px',
      marginBottom: '200px',
      padding: '20px',
      background: 'linear-gradient(to bottom, #fff8f8, #fff)',
      boxShadow: '0 4px 15px rgba(255, 0, 0, 0.1)',
      borderRadius: '15px',
      maxWidth: '800px',
      margin: '145px auto 200px'
    }}>
      <h2 className="order-summary-title" style={{
        textAlign: 'center',
        color: '#ff4d4f',
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '25px',
        borderBottom: '2px dashed #ffcccb',
        paddingBottom: '15px'
      }}>
        <ThunderboltFilled style={{ marginRight: '10px' }} />
        Confirm Order
      </h2>

      {/* Order Items Section */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '15px',
        boxShadow: '0 2px 8px rgba(255, 77, 79, 0.1)',
        marginBottom: '20px'
      }}>
        {cart.map((item) => (
          <div key={item.id} className="order-item" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            margin: '8px 0',
            borderBottom: '1px solid #ffe6e6',
            transition: 'transform 0.2s',
            ':hover': {
              transform: 'translateX(5px)'
            }
          }}>
            <span className="item-name" style={{
              color: '#333',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{
                background: '#ff4d4f',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
                fontSize: '14px'
              }}>{item.quantity}</span>
              {item.name}
            </span>
            <span className="item-price" style={{
              color: '#ff4d4f',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>₹{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Cart Summary Section */}
      <div className="cart-summary" style={{ 
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(255, 77, 79, 0.1)',
        marginTop: '20px'
      }}>
        <div className="subtotal" style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '15px',
          borderBottom: '2px dashed #ffcccb',
          paddingBottom: '15px'
        }}>
          <span style={{ fontSize: '18px', color: '#666' }}>Subtotal</span>
          <span style={{ fontSize: '18px', color: '#ff4d4f', fontWeight: 'bold' }}>
            ₹{subtotal.toFixed(2)}
          </span>
        </div>
        
        {/* Charges Breakdown */}
        {chargesLoading ? (
          <div style={{ textAlign: 'center', color: '#ff4d4f' }}>Loading charges...</div>
        ) : (
          Object.entries(breakdown).map(([name, detail]) => (
            <div key={name} className="charge-item" style={{
              display: 'flex',
              justifyContent: 'space-between',
              margin: '10px 0',
              color: '#666'
            }}>
              <span style={{ fontSize: '16px' }}>
                {name} 
                {detail.type === 'percentage' && 
                  <small style={{ color: '#999' }}> ({detail.value}%)</small>
                }
              </span>
              <span style={{ color: '#ff4d4f' }}>₹{detail.amount.toFixed(2)}</span>
            </div>
          ))
        )}

        {/* Total Amount */}
        <div className="total" style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '20px',
          borderTop: '2px solid #ff4d4f',
          paddingTop: '20px',
          fontWeight: 'bold',
          fontSize: '22px'
        }}>
          <span>Grand Total</span>
          <span style={{ color: '#ff4d4f' }}>₹{calculatedTotal.toFixed(2)}</span>
        </div>
      </div>




      




      {/* Suggestion Bubble */}
      {showBubble && (
        <div
          className={`suggestion-bubble ${animationClass}`}
          onClick={handleBubbleClick}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px',
            borderRadius: '80%',
            position: 'fixed',
            bottom: '150px',
            right: '30px',
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
          }}
        >
          <SmileOutlined style={{ fontSize: '24px' }} />
          <p style={{ margin: 0 }}></p>
        </div>
      )}

      <Modal
        title="Special Treats on Us!"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        bodyStyle={{ padding: '20px', backgroundColor: '#fff' }}
        style={{ borderRadius: '10px' }}
      >
        <div style={{ textAlign: 'center', color: '#ff6347', fontSize: '1.2em' }}>
        🔥 Tell us your flavor! Extra spicy, less salt, saucy, or dry – your call! 🌶️👌
      </div>
        <p style={{ textAlign: 'center', color: '#777', marginTop: '10px', fontSize: '1em' }}>
        🍛 Got a taste for more? Just say the word! 🍴🤩
      </p>
        <div className="suggestions-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          {suggestedItems.map((item) => (
            <div key={item.name} className="suggestion-item" style={{
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              border: '2px solid #ff6347',
              borderRadius: '8px',
              padding: '10px',
              backgroundColor: '#fff5f5',
              width: '90%',
              boxShadow: '0 0 10px rgba(255, 99, 71, 0.3)',
              transition: 'transform 0.3s ease-in-out',
            }}>
              <img src={item.image} alt={item.name} style={{ width: '50px', marginRight: '10px', borderRadius: '5px' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#ff6347' }}>{item.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>{item.quote}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Checkbox for enabling customization */}
        <Checkbox
          checked={isCustomizing}
          onChange={(e) => setIsCustomizing(e.target.checked)}
        >
          Add cooking customization notes
        </Checkbox>

        {/* Conditionally render the description input */}
        {isCustomizing && (
          <Input.TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter your special requests here..."
            style={{
              marginTop: '10px',
              borderRadius: '5px',
              borderColor: '#ff6347',
              width: '90%',
              alignSelf: 'center'
            }}
            rows={3}
          />
        
        )}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button onClick={() => setIsModalVisible(false)} style={{ marginRight: '10px' }}>
            Submit
          </Button>
        </div>
        
      </Modal>


      {/* Confirm Order Button */}
      <button 
        className="pay-button" 
        onClick={handlePayClick}
        disabled={chargesLoading}
        style={{
          width: '100%',
          padding: '15px',
          backgroundColor: chargesLoading ? '#ccc' : '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          marginTop: '25px',
          cursor: chargesLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(255, 77, 79, 0.2)',
          ':hover': {
            backgroundColor: chargesLoading ? '#ccc' : '#ff7875',
            transform: chargesLoading ? 'none' : 'translateY(-2px)'
          }
        }}
      >
        <CheckOutlined style={{ marginRight: '10px' }} />
        Confirm Order
      </button>
    </div>
  );
}

export default OrderSummary;