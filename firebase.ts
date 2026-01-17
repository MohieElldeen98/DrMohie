
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAJFUEZPMqbbn395nIbY8HF3S99cBhQ5A",
  authDomain: "drmohie-538d8.firebaseapp.com",
  projectId: "drmohie-538d8",
  storageBucket: "drmohie-538d8.firebasestorage.app",
  messagingSenderId: "831480734094",
  appId: "1:831480734094:web:85587b007ada28cea184df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
