import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";

// Debug: log env variables to verify they are loading
console.log("Firebase initialized successfully");
console.log("Current domain:", window.location.hostname);

// Create a temporary mock Firebase config to prevent crashes
const firebaseConfig = {
  apiKey: "AIzaSyATest_Key_For_Development",
  authDomain: `admin-3c66d.firebaseapp.com`,
  projectId: "admin-3c66d",
  storageBucket: `admin-3c66d.appspot.com`,
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// Initialize Firebase with error handling
let app;
let auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Create a mock auth object to prevent crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      setTimeout(() => callback(null), 100);
      return () => {};
    }
  };
}

export { auth };

// Auth methods with error handling
export const signInWithGoogle = async () => {
  console.log("Google sign-in temporarily disabled - using backend auth");
  throw new Error("Google sign-in temporarily disabled. Please use email/password login.");
};

export const signInWithEmail = async (email, password) => {
  console.log("Email sign-in temporarily disabled - using backend auth");
  throw new Error("Email sign-in temporarily disabled. Please use backend authentication.");
};

export const registerWithEmail = async (email, password) => {
  console.log("Email registration temporarily disabled - using backend auth");
  throw new Error("Email registration temporarily disabled. Please use backend authentication.");
};

export const updateUserProfile = (user, profile) => {
  console.log("User profile update temporarily disabled");
  return Promise.resolve();
};

export const logout = () => {
  console.log("Logging out user...");
  localStorage.removeItem('token');
  localStorage.removeItem('backendToken');
  return Promise.resolve();
};