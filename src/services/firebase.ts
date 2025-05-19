import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBB4USjKC8II_CPdqydkPUhkUtYFLS6lRQ",
  authDomain: "tech-blog-935d5.firebaseapp.com",
  projectId: "tech-blog-935d5",
  storageBucket: "tech-blog-935d5.firebasestorage.app",
  messagingSenderId: "752567294100",
  appId: "1:752567294100:web:b30fde700c7166c586fc81",
  measurementId: "G-LVQXWJGNYC"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };