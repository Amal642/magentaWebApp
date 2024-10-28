// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaZL68weKvtFeeC86doCncvCRrBvx-SY4",
  authDomain: "magenta-e8ada.firebaseapp.com",
  projectId: "magenta-e8ada",
  storageBucket: "magenta-e8ada.appspot.com",
  messagingSenderId: "739615894292",
  appId: "1:739615894292:web:4c6c2a7147dfad55543001"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
