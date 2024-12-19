import React, { useState, useEffect } from 'react'; 
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const navigate = useNavigate();
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const styles = `
      @keyframes bounceUpDown {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      .cart-items-container::-webkit-scrollbar {
        width: 8px;
      }

      .cart-items-container::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      .cart-items-container::-webkit-scrollbar-thumb {
        background: #FF4742;
        border-radius: 4px;
      }

      .cart-items-container::-webkit-scrollbar-thumb:hover {
        background: #FF8142;
      }

      .cart-items-container {
        scrollbar-width: thin;
        scrollbar-color: #FF4742 #f1f1f1;
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    
    return () => styleSheet.remove();
  }, []);

  const handlePlaceOrder = () => {
    navigate('/order-summary');
  };

  const handleBrowseMenu = () => {
    navigate('/home');
  };
  
  const getImageUrl = (imageData) => {
    if (!imageData) return '';
    if (typeof imageData === 'string') {
      return imageData;
    }
    if (imageData.file && imageData.file.url) {
      return imageData.file.url;
    }
    return '';
  };

  const foodEmojis = ['🍕', '🍔', '🍟', '🌮', '🍜', '🍱', '🍗', '🥗'];
  const randomEmoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];

  const handleScroll = (e) => {
    const element = e.target;
    const isNotAtBottom = element.scrollHeight - element.scrollTop > element.clientHeight + 50;
    setShowScrollIndicator(isNotAtBottom);
  };

  useEffect(() => {
    const cartItems = document.querySelector('.cart-items-container');
    if (cartItems) {
      setShowScrollIndicator(cartItems.scrollHeight > cartItems.clientHeight);
    }
  }, [cart]);

  return (
    <div className="cart-container" style={{ 
      padding: '15px',
      maxWidth: '600px',
      margin: '120px auto 150px',
      backgroundColor: '#fff',
      borderRadius: '20px',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        fontSize: '1.8rem',
        textAlign: 'center',
        color: '#FF4742',
        marginBottom: '25px',
        fontWeight: 'bold',
        paddingTop: '10px'
      }}>Your Food Cart 🍽️</h2>

      {cart.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
          backgroundColor: '#fff',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '20px' 
          }}>
            🛒
          </div>
          <h3 style={{ 
            fontSize: '1.4rem', 
            color: '#333', 
            marginBottom: '10px',
            fontWeight: 'bold' 
          }}>
            Your cart is empty
          </h3>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666', 
            marginBottom: '30px',
            maxWidth: '280px' 
          }}>
            Looks like you haven't added any delicious items yet! 🍽️
          </p>
          <button
            onClick={handleBrowseMenu}
            style={{
              background: '#FF4742',
              color: '#fff',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(255, 71, 66, 0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Browse Menu 🍳
          </button>
        </div>
      ) : (
        <>
          <div 
            className="cart-items-container"
            onScroll={handleScroll}
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px',
              marginBottom: '20px',
              scrollBehavior: 'smooth',
              position: 'relative'
            }}
          >
            {cart.map((item) => (
              <div key={item.id} style={{
                background: '#fff',
                borderRadius: '15px',
                padding: '15px',
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '12px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      color: '#333',
                      marginBottom: '5px'
                    }}>{item.name}</h3>
                    <p style={{ 
                      color: '#FF4742', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem' 
                    }}>₹{item.price}</p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '10px'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          border: '2px solid #FF4742',
                          background: 'white',
                          color: '#FF4742',
                          fontSize: '1.2rem',
                          cursor: 'pointer'
                        }}
                      >-</button>
                      <span style={{ 
                        fontSize: '1.1rem',
                        fontWeight: 'bold' 
                      }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          border: 'none',
                          background: '#FF4742',
                          color: 'white',
                          fontSize: '1.2rem',
                          cursor: 'pointer'
                        }}
                      >+</button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      color: '#999'
                    }}
                  >×</button>
                </div>
              </div>
            ))}

            {showScrollIndicator && (
              <div style={{
                position: 'sticky',
                bottom: 0,
                left: 0,
                right: 0,
                textAlign: 'center',
                padding: '15px',
                background: 'linear-gradient(transparent, rgba(255,255,255,0.95) 40%)',
                pointerEvents: 'none',
                animation: 'bounceUpDown 2s infinite',
                zIndex: 2
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    lineHeight: '1'
                  }}>
                    {/* <span role="img" aria-label="scroll indicator">🍕</span>
                    <span role="img" aria-label="scroll indicator">🍔</span> */}
                    <span role="img" aria-label="scroll down">⬇️</span>
                  </div>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#FF4742',
                    fontWeight: 'bold',
                    textShadow: '0 0 10px white'
                  }}>
                    Scroll for more yummy items!
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{
            position: 'fixed',
            bottom: '70px',
            left: 0,
            right: 0,
            padding: '15px',
            background: 'white',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            gap: '10px',
            zIndex: 1000,
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <button
              onClick={() => navigate('/home')}
              style={{
                flex: 1,
                padding: '15px',
                border: '2px solid red',
                borderRadius: '12px',
                background: 'white',
                color: 'red',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                zIndex: 1001,
              }}
            >
              Add More
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              style={{
                flex: 2,
                padding: '15px',
                border: 'none',
                borderRadius: '12px',
                background: '#FF4742',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(255, 71, 66, 0.2)',
                zIndex: 1001,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Placing Order...' : 'Review Order'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
