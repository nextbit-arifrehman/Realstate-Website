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

// Firebase configuration - using your provided credentials
const firebaseConfig = {
  apiKey: "AIzaSyDsut7TB-t5mBaSQNFO8iDZuY_fcldJmBo",
  authDomain: "void-5a292.firebaseapp.com",
  projectId: "void-5a292",
  storageBucket: "void-5a292.firebasestorage.app",
  messagingSenderId: "752168297291",
  appId: "1:752168297291:web:78a8c8f93961c5ba6abece"
};

console.log("Firebase Web SDK initializing...");
console.log("Project ID:", firebaseConfig.projectId);

// Initialize Firebase Web SDK
let app;
let auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("✅ Firebase Web SDK initialized successfully");
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    // App already exists, just get the auth instance
    auth = getAuth();
    console.log("✅ Firebase Web SDK already initialized, using existing instance");
  } else {
    console.error("❌ Firebase Web SDK initialization failed:", error);
    throw error;
  }
}

export { auth };

// Set up Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Helper function to sync user with backend
const syncUserWithBackend = async (user) => {
  try {
    const idToken = await user.getIdToken();
    
    // Get backend URL based on environment - use proxy in Replit
    const getBackendURL = () => {
      const hostname = window.location.hostname;
      if (hostname.includes('replit.dev')) {
        // Use relative URL to leverage Vite proxy
        return "/api/auth/login";
      }
      return "http://localhost:5000/api/auth/login";
    };
    
    const response = await fetch(getBackendURL(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", idToken);
      console.log("✅ User synced with backend successfully");
    } else {
      console.log("Backend sync failed, using Firebase user data");
      // Store Firebase user data as fallback
      const firebaseUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL,
        role: 'user', // Default role
        isFraud: false
      };
      localStorage.setItem("user", JSON.stringify(firebaseUser));
      localStorage.setItem("token", idToken);
    }
  } catch (error) {
    console.error("Backend sync error:", error);
    console.warn("Backend sync failed, using Firebase user data:", error.message);
    
    // Store Firebase user data as fallback
    const firebaseUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      photoURL: user.photoURL,
      role: 'user', // Default role
      isFraud: false
    };
    localStorage.setItem("user", JSON.stringify(firebaseUser));
    localStorage.setItem("token", await user.getIdToken());
  }
};

// Google Sign-in
export const signInWithGoogle = async () => {
  console.log("Attempting Google sign-in...");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log("✅ Google sign-in successful:", result.user.email);
    
    // Sync user with backend
    await syncUserWithBackend(result.user);
    
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

// Email/Password Sign-in
export const signInWithEmail = async (email, password) => {
  console.log("Attempting email sign-in for:", email);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Email sign-in successful:", result.user.email);
    
    // Sync user with backend
    await syncUserWithBackend(result.user);
    
    return result;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

// Email/Password Sign-up
export const signUpWithEmail = async (email, password, displayName) => {
  console.log("Attempting email sign-up for:", email);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with display name
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    console.log("✅ Email sign-up successful:", result.user.email);
    
    // Sync user with backend
    await syncUserWithBackend(result.user);
    
    return result;
  } catch (error) {
    console.error("Email sign-up error:", error);
    throw error;
  }
};

export const registerWithEmail = async (email, password) => {
  console.log("Attempting email registration for:", email);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Email registration successful:", result.user.email);
    
    // Sync user with backend
    await syncUserWithBackend(result.user);
    
    return result;
  } catch (error) {
    console.error("Email registration error:", error);
    throw error;
  }
};

export const updateUserProfile = (user, profile) => {
  console.log("Updating user profile for:", user.email);
  return updateProfile(user, profile);
};

export const logout = () => {
  console.log("Logging out user...");
  localStorage.removeItem('token');
  return signOut(auth);
};
