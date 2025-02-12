import { initializeApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBbHgGdA7scCFHkv0aOKs0IOVAzKOJlqjw",

  authDomain: "production-db-993e8.firebaseapp.com",

  databaseURL: "https://production-db-993e8-default-rtdb.firebaseio.com",

  projectId: "production-db-993e8",

  storageBucket: "production-db-993e8.firebasestorage.app",

  messagingSenderId: "796625414381",

  appId: "1:796625414381:web:1dcbd55e84a3502b8744e4",

  measurementId: "G-W3D3NSCF2Q",
};

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const messaging = getMessaging(app);

export async function generateToken() {
  const permision = await Notification.requestPermission();
  console.log(permision);

  if (permision !== "granted") {
    console.log("please allow notifications.");
    // UI
    return;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey:
        "BC8DuLFuRoc15xWGyACC0F8I535dyWPW4sHFkPIEXHfEu9YGMjEt5Phvj_-HS66VDozCpAOZCqp6zL6S_FlKeUk",
    });
    if (!token) {
      //display error, unable to genearte a token so can you refresh the page..
      console.log("unable to generate a token so can you refresh the page...");
      return;
    }

    console.log("token is ", token);

    const orgId = window.localStorage.getItem("orgId");

    const TOKEN_DOC_ID = "token";
    const tokenDocRef = doc(db, "organizations", orgId, "tokens", TOKEN_DOC_ID);

    await setDoc(tokenDocRef, {
      fcmToken: token,
      updatedAt: new Date(),
    });

    const docRef = doc(db, `organizations/${orgId}/tokens/token`);
    const docSnap = await getDoc(docRef);
  } catch (error) {
    console.log("messaging error is ", error);
  }
}