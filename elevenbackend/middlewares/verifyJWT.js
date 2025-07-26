// middlewares/verifyJWT.js
const { auth } = require('../utils/firebaseAdmin');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: No token provided',
      code: 'UNAUTHORIZED_NO_TOKEN',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!auth) {
      return res.status(503).json({
        error: 'Firebase authentication is not available. Please configure Firebase credentials.',
        code: 'FIREBASE_UNAVAILABLE',
      });
    }

    const decodedToken = await auth.verifyIdToken(token);
    
    // Fetch user from database to get role
    const User = require('../models/User');
    let dbUser = await User.findByUid(req.db, decodedToken.uid);
    
    // If user doesn't exist in database, create them with default role
    if (!dbUser) {
      dbUser = await User.create(req.db, {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
        photoURL: decodedToken.picture,
        role: 'user', // Default role
        verificationStatus: 'verified',
        isFraud: false
      });
      console.log('Creating new user for', decodedToken.email);
    }
    
    // Add user info to request with role from database
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: dbUser.displayName || decodedToken.name || decodedToken.email?.split('@')[0],
      photoURL: dbUser.photoURL || decodedToken.picture,
      role: dbUser.role || 'user',
      backendId: `user_${decodedToken.uid}`
    };
    
    next();
  } catch (error) {
    console.error('Login error:', error);
    return res.status(403).json({
        error: 'Forbidden: Invalid or expired token',
        code: 'FORBIDDEN_INVALID_TOKEN',
    });
  }
};

module.exports = verifyJWT;