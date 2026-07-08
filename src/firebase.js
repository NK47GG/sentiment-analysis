
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2Xumnnnnr34peuhudDDN_Sbhjp-IEUPY",
  authDomain: "insightify-2caf8.firebaseapp.com",
  projectId: "insightify-2caf8",
  storageBucket: "insightify-2caf8.appspot.com",
  messagingSenderId: "1033574635832",
  appId: "1:1033574635832:web:8b06416339c20aaa6349cd",
  measurementId: "G-0YDKSQN3C0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
