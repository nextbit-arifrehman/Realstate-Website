// routes/reviewRoutes.js

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const verifyJWT = require('../middlewares/verifyJWT');
const verifyRole = require('../middlewares/verifyRole');

// Public route to get reviews for a specific property
router.get('/property/:propertyId', reviewController.getReviewsByProperty);

// Public route to get latest reviews for homepage
router.get('/latest', reviewController.getLatestReviewsForHomepage);

// Protected routes - user must be logged in
router.use(verifyJWT);

// Add review - only user can add review
router.post('/', verifyRole('user'), reviewController.addReview);

// Get reviews by logged-in user (My Reviews page)
router.get('/my-reviews', verifyRole('user'), reviewController.getMyReviews);

// Delete review by ID (user can delete own review, admin can delete any review)
router.delete('/:id', reviewController.deleteReview);

// Admin route to get all reviews
router.get('/', verifyRole('admin'), reviewController.getAllReviews);
router.get('/admin/all', verifyRole('admin'), reviewController.getAllReviews);

module.exports = router;