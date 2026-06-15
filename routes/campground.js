const express = require('express');
const router = express.Router();
const catchAsync = require('../Utils/catchAsync.js');
const ExpressError = require('../Utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../Schemas');
const { isLoggedIn } = require('../middleware.js');

// INDEX ROUTE

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// VALIDATION MIDDLEWARE

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
};


// NEW ROUTE

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});


// CREATE ROUTE

router.post(
    '/',
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {

        const campground = new Campground(req.body.campground);

        await campground.save();

        req.flash('success', 'Successfully created a new campground!');

        res.redirect(`/campgrounds/${campground._id}`);
    })
);


// SHOW ROUTE

router.get('/:id', catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findById(id).populate('reviews');

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground });
}));


// EDIT ROUTE

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}));


// UPDATE ROUTE

router.put(
    '/:id',
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {

        const { id } = req.params;

        const campground = await Campground.findByIdAndUpdate(
            id,
            { ...req.body.campground },
            { new: true, runValidators: true }
        );

        req.flash('success', 'Successfully updated the campground!');
        if (!campground) {
            req.flash('error', 'Campground Not Found');
            return res.redirect('/campgrounds');
        }

        res.redirect(`/campgrounds/${campground._id}`);
    })
);


// DELETE ROUTE

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findByIdAndDelete(id);

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }
    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;