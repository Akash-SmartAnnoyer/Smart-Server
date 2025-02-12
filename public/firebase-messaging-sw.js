importScripts(
    "https://www.gstatic.com/firebasejs/11.3.0/firebase-app-compat.js"
  );
  importScripts(
    "https://www.gstatic.com/firebasejs/11.3.0/firebase-messaging-compat.js"
  );
  
  firebase.initializeApp({
    apiKey: "AIzaSyBbHgGdA7scCFHkv0aOKs0IOVAzKOJlqjw",
  
    authDomain: "production-db-993e8.firebaseapp.com",
  
    databaseURL: "https://production-db-993e8-default-rtdb.firebaseio.com",
  
    projectId: "production-db-993e8",
  
    storageBucket: "production-db-993e8.firebasestorage.app",
  
    messagingSenderId: "796625414381",
  
    appId: "1:796625414381:web:1dcbd55e84a3502b8744e4",
  
    measurementId: "G-W3D3NSCF2Q",
  });
  
  const messaging = firebase.messaging();
  
  messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Received background message:", payload);
  
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || "/Ammammagarillu-logo.jpg",
    };
  
    self.registration.showNotification(notificationTitle, notificationOptions);
  });