// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD_sHP7beJGl-x1G8lyWYSwomWotHEN_EU",
    authDomain: "convergehub-306f2.firebaseapp.com",
    projectId: "convergehub-306f2",
    storageBucket: "convergehub-306f2.firebasestorage.app",
    messagingSenderId: "397986761903",
    appId: "1:397986761903:web:ddb6a8f1985b65cd82d85a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };