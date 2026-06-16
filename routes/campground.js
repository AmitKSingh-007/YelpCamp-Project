const express = require('express');
const router = express.Router();

const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../Utils/catchAsync');

const {
    isLoggedIn,
    isAuthor,
    validateCampground
} = require('../middleware');

// ==========================================
// Campgrounds Index & Create
// ==========================================

router.route('/')
    .get(
        catchAsync(campgrounds.index)
    )
    .post(
        isLoggedIn,
        validateCampground,
        catchAsync(campgrounds.createCampground)
    );

// ==========================================
// New Campground Form
// ==========================================

router.get(
    '/new',
    isLoggedIn,
    campgrounds.renderNewForm
);

// ==========================================
// Show, Update & Delete Campground
// ==========================================

router.route('/:id')
    .get(
        catchAsync(campgrounds.showCampground)
    )
    .put(
        isLoggedIn,
        isAuthor,
        validateCampground,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(
        isLoggedIn,
        isAuthor,
        catchAsync(campgrounds.deleteCampground)
    );

// ==========================================
// Edit Campground Form
// ==========================================

router.get(
    '/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

module.exports = router;