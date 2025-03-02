import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function PopupNotification({ notification, onClose }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    if (notification.data?.url) {
      navigate(notification.data.url);
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        width: '90%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
      onClick={handleClick}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {notification.icon && (
          <img 
            src={notification.icon} 
            alt="notification icon" 
            style={{ width: '40px', height: '40px' }}
          />
        )}
        <div>
          <div style={{ fontWeight: 'bold' }}>{notification.title}</div>
          <div style={{ fontSize: '0.9em' }}>{notification.body}</div>
        </div>
      </div>
    </div>
  );
}

export default PopupNotification; 