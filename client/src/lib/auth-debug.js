// Debug utility to check authentication tokens
export const checkAuthTokens = () => {
  const firebaseToken = localStorage.getItem('token');
  const backendToken = localStorage.getItem('backendToken');
  const user = localStorage.getItem('user');

  console.log("🔍 Authentication Debug Check:");
  console.log("Firebase Token:", firebaseToken ? "✅ Present" : "❌ Missing");
  console.log("Backend Token:", backendToken ? "✅ Present" : "❌ Missing");
  console.log("User Data:", user ? "✅ Present" : "❌ Missing");

  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log("👤 User Info:", {
        email: userData.email,
        role: userData.role,
        uid: userData.uid
      });
    } catch (e) {
      console.log("❌ Invalid user data in localStorage");
    }
  }

  return {
    hasFirebaseToken: !!firebaseToken,
    hasBackendToken: !!backendToken,
    hasUser: !!user
  };
};

// Function to test API authentication
export const testAPIAuth = async () => {
  try {
    const response = await fetch('/api/wishlist', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('backendToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("🔍 API Auth Test:");
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    
    if (response.ok) {
      console.log("✅ API authentication successful");
    } else {
      console.log("❌ API authentication failed");
    }
    
    return response.ok;
  } catch (error) {
    console.log("❌ API test error:", error);
    return false;
  }
};