import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBbHgGdA7scCFHkv0aOKs0IOVAzKOJlqjw",
  authDomain: "production-db-993e8.firebaseapp.com",
  projectId: "production-db-993e8",
  storageBucket: "production-db-993e8.firebasestorage.app",
  messagingSenderId: "796625414381",
  appId: "1:796625414381:web:1dcbd55e84a3502b8744e4"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const db = getFirestore(app);

export const requestFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "BC8DuLFuRoc15xWGyACC0F8I535dyWPW4sHFkPIEXHfEu9YGMjEt5Phvj_-HS66VDozCpAOZCqp6zL6S_FlKeUk"
      });

      // Store token in your database
      const orgId = window.localStorage.getItem("orgId");
      if (orgId && token) {
        const tokenDocRef = doc(db, "organizations", orgId, "tokens", "token");
        await setDoc(tokenDocRef, {
          fcmToken: token,
          updatedAt: new Date(),
        });
      }

      return token;
    }
    throw new Error('Notification permission denied');
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export { db, messaging };