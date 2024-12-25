import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyARms0nFhoQqtAojws1H4ffJfxKH9MBuJ4",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://smartdb-175f4-default-rtdb.firebaseio.com",
  projectId: "stage-smart-server",
  storageBucket: "stage-smart-server.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);