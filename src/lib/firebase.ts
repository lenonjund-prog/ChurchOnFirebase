import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZPTtTJazuPKnPv0YwqqWuOJbn_D0DepI",
  authDomain: "churchon-9ad49.firebaseapp.com",
  projectId: "churchon-9ad49",
  storageBucket: "churchon-9ad49.appspot.com",
  messagingSenderId: "798272968595",
  appId: "1:798272968595:web:8e960b8a4ae7ccbc90fa66"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
