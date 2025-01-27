import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyARms0nFhoQqtAojws1H4ffJfxKH9MBuJ4",
<<<<<<< Updated upstream
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://smart-server-menu-database.firebaseio.com",
  projectId: "stage-smart-server",
  storageBucket: "stage-smart-server.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
=======
  authDomain: "production-firestore-db.firebaseapp.com",
  projectId: "production-firestore-db",
  storageBucket: "production-firestore-db.appspot.com",
  messagingSenderId: "831888702073",
  appId: "1:831888702073:web:YOUR_APP_ID_HERE" // You'll need to get this from your Firebase console
>>>>>>> Stashed changes
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);