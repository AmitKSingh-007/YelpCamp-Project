const ExpressError = require('./Utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./Schemas');

// LOGIN Validate middleware

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Please login to continue!');
        return res.redirect('/login');
    }
    next();
};

// Return to same page after login middleware

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// VALIDATION MIDDLEWARE for campgrounds router

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
};

// AUTHORIZATION MIDDLEWARE for campgrounds router

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }

    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'Access Denied');
        return res.redirect(`/campgrounds/${campground._id}`);
    }

    next();
};

// Validate review middleware

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
};

// ReviewAuthor middleware

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        req.flash('error', 'Review Not Found');
        return res.redirect('/campgrounds');
    }

    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'Access Denied');
        return res.redirect(`/campgrounds/${id}`);
    }

    next();
};