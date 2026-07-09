const express = require('express');
const router = express.Router({ mergeParams: true });

const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');

const {
    isLoggedIn,
    isReviewAuthor,
    validateReview
} = require('../middleware/JOImiddleware');

// ==========================================
// Create Review
// ==========================================

router.route('/')
    .post(
        isLoggedIn,
        validateReview,
        catchAsync(reviews.createReview)
    );

// ==========================================
// Delete Review
// ==========================================

router.route('/:reviewId')
    .delete(
        isLoggedIn,
        isReviewAuthor,
        catchAsync(reviews.deleteReview)
    );

module.exports = router;