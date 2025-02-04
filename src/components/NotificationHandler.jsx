import React, { useEffect, useState } from 'react';
import { messaging } from '../pages/fireBaseConfig';
import { getToken, onMessage } from 'firebase/messaging';

const NotificationHandler = () => {
  const [token, setToken] = useState('');
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);

  const vapidKey = 'BC8DuLFuRoc15xWGyACC0F8I535dyWPW4sHFkPIEXHfEu9YGMjEt5Phvj_-HS66VDozCpAOZCqp6zL6S_FlKeUk';

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        if (!messaging) {
          throw new Error('Messaging not initialized');
        }

        // Register service worker first
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/firebase-cloud-messaging-push-scope'
            });
            console.log('Service Worker registered with scope:', registration.scope);
          } catch (err) {
            console.error('Service Worker registration failed:', err);
            throw err;
          }
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          try {
            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) {
              setToken(currentToken);
              console.log('FCM Token:', currentToken);
            }
          } catch (tokenError) {
            console.error('Error getting token:', tokenError);
            setError(tokenError.message);
          }
        }
      } catch (error) {
        console.error('Notification initialization error:', error);
        setError(error.message);
      }
    };

    initializeNotifications();
  }, []);

//   const testNotification = () => {
//     console.log('Testing notification...');
//     const testPayload = {
//       notification: {
//         title: "Test Notification",
//         body: "This is a test notification"
//       }
//     };
    
//     setNotification(testPayload);
    
//     if (Notification.permission === 'granted') {
//       new Notification(testPayload.notification.title, {
//         body: testPayload.notification.body
//       });
//     }
//   };

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: '1px solid #ccc',
      borderRadius: '5px'
    }}>
      {/* <h3>Notification Testing Panel</h3> */}
      
      {/* <button 
        onClick={testNotification}
        style={{
          padding: '10px 20px',
          margin: '10px 0',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Notification
      </button> */}

      {/* {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )} */}

      {/* {token && (
        <div style={{ margin: '10px 0' }}>
          <p>Your FCM Token:</p>
          <textarea 
            readOnly 
            value={token} 
            style={{
              width: '100%',
              height: '60px',
              marginTop: '5px',
              padding: '5px'
            }}
          />
        </div>
      )} */}

      {notification && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '10px',
          marginTop: '10px',
          borderRadius: '5px'
        }}>
          <h4>{notification.notification?.title}</h4>
          <p>{notification.notification?.body}</p>
        </div>
      )}
    </div>
  );
};

export default NotificationHandler; 