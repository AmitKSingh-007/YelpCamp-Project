const express = require('express');
const router = express.Router();
const upload = require("../middleware/upload");

const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');

const uploadImages = upload.array("images", 5);

const {
    isLoggedIn,
    isAuthor,
    validateCampground
} = require('../middleware/JOImiddleware');

// ==========================================
// Campgrounds Index & Create
// ==========================================

router.route('/')
    .get(
        catchAsync(campgrounds.index)
    )
    .post(
        isLoggedIn,
        uploadImages,
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
        uploadImages,
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