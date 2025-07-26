import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import apiClient from "../lib/api";

const AuthContext = createContext({
  user: null,
  loading: true
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          
          // Store the token in localStorage for API requests
          localStorage.setItem('token', idToken);
          
          // Create user object with Firebase data and default role
          const userWithDefaults = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            role: "user",
            verified: false,
            isFraud: false
          };
          
          // Check if user data exists in localStorage first
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setUser(parsedUser);
              console.log("✅ User loaded from localStorage");
            } catch (e) {
              console.warn("Invalid user data in localStorage, using Firebase data");
              setUser(userWithDefaults);
            }
          } else {
            // Set user immediately for better UX
            setUser(userWithDefaults);
            localStorage.setItem('user', JSON.stringify(userWithDefaults));
          }
          
          // Try to sync with backend in the background
          try {
            console.log("Attempting to sync with backend...");
            console.log("Backend URL:", apiClient.defaults.baseURL);
            
            // Use a timeout for faster fallback
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
            
            const loginResponse = await apiClient.post("/api/auth/login", {
              idToken: idToken
            }, {
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (loginResponse.status === 200) {
              const { user: dbUser, token: backendToken } = loginResponse.data;
              
              // Store the backend JWT token
              if (backendToken) {
                localStorage.setItem('backendToken', backendToken);
                console.log("🔑 Backend JWT token stored in localStorage");
              }
              
              const mergedUser = { 
                uid: dbUser.uid || userWithDefaults.uid,
                email: dbUser.email || userWithDefaults.email,
                displayName: dbUser.displayName || userWithDefaults.displayName,
                photoURL: dbUser.photoURL || userWithDefaults.photoURL,
                role: dbUser.role || "user",
                verified: dbUser.verified || false,
                isFraud: dbUser.isFraud || false
              };
              localStorage.setItem('user', JSON.stringify(mergedUser));
              setUser(mergedUser);
              console.log("✅ User synced with MongoDB backend:", mergedUser.email, "Role:", mergedUser.role);
            }
          } catch (loginError) {
            console.log("Backend sync failed, using Firebase user data - this is normal in development");
            console.log("Firebase authentication is working correctly");
            // User data already set above, application works without backend sync
          }
        } catch (error) {
          console.error("Error processing user authentication:", error);
          // Create fallback user data
          const fallbackUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            photoURL: firebaseUser.photoURL,
            role: "user",
            verified: false,
            isFraud: false
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('backendToken');
        localStorage.removeItem('user');
        console.log("User signed out");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshUserData = async () => {
    if (!user || !auth.currentUser) {
      console.log("No user or Firebase auth not available for refresh");
      return user;
    }
    
    try {
      console.log("Getting fresh Firebase ID token...");
      const idToken = await auth.currentUser.getIdToken(true); // Force refresh
      
      console.log("Calling backend /api/auth/login with fresh token...");
      const loginResponse = await apiClient.post("/api/auth/login", {
        idToken: idToken
      });
      
      if (loginResponse.status === 200) {
        const { user: dbUser, token: backendToken } = loginResponse.data;
        console.log("Backend response:", dbUser);
        
        // Store the backend JWT token for refresh
        if (backendToken) {
          localStorage.setItem('backendToken', backendToken);
          console.log("🔑 Backend JWT token refreshed and stored");
        }
        
        const mergedUser = { 
          uid: dbUser.uid || user.uid,
          email: dbUser.email || user.email,
          displayName: dbUser.displayName || user.displayName,
          photoURL: dbUser.photoURL || user.photoURL,
          role: dbUser.role || user.role,
          verified: dbUser.verified || false,
          isFraud: dbUser.isFraud || false
        };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        console.log("✅ User data refreshed from database:", mergedUser.email, "Role:", mergedUser.role);
        return mergedUser;
      }
    } catch (error) {
      console.error("Failed to refresh user data from backend:", error.response?.data || error.message);
      return user; // Return current user if refresh fails
    }
  };

  const value = {
    user,
    loading,
    refreshUserData
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};