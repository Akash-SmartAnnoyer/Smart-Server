import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARms0nFhoQqtAojws1H4ffJfxKH9MBuJ4",
  authDomain: "production-firestore-db.firebaseapp.com",
  projectId: "production-firestore-db",
  storageBucket: "production-firestore-db.appspot.com",
  messagingSenderId: "831888702073",
  appId: "1:831888702073:web:YOUR_APP_ID_HERE" // You'll need to get this from your Firebase console
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);