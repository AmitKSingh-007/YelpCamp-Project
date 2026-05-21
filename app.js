const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./Utils/ExpressError');
const catchAsync = require('./Utils/catchAsync.js');
const methodOverride = require('method-override');

const { campgroundSchema, reviewSchema } = require('./Schemas');

const Campground = require('./models/campground');
const Review = require('./models/review');

const app = express();

mongoose.set('strictQuery', true);

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log('Database Connected');
    })
    .catch(err => {
        console.log('Mongo Connection Error!');
        console.log(err);
    });

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


// VALIDATION MIDDLEWARE

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }

    next();
};


// HOME ROUTE

app.get('/', (req, res) => {
    res.send('Hello from YelpCamp!!');
});


// INDEX ROUTE

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));


// NEW ROUTE

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});


// CREATE ROUTE

app.post(
    '/campgrounds',
    validateCampground,
    catchAsync(async (req, res) => {

        const campground = new Campground(req.body.campground);

        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);


// SHOW ROUTE

app.get('/campgrounds/:id', catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findById(id).populate('reviews');

    if (!campground) {
        throw new ExpressError('Campground Not Found', 404);
    }

    res.render('campgrounds/show', { campground });
}));


// EDIT ROUTE

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        throw new ExpressError('Campground Not Found', 404);
    }

    res.render('campgrounds/edit', { campground });
}));


// UPDATE ROUTE

app.put(
    '/campgrounds/:id',
    validateCampground,
    catchAsync(async (req, res) => {

        const { id } = req.params;

        const campground = await Campground.findByIdAndUpdate(
            id,
            { ...req.body.campground },
            { new: true, runValidators: true }
        );

        if (!campground) {
            throw new ExpressError('Campground Not Found', 404);
        }

        res.redirect(`/campgrounds/${campground._id}`);
    })
);


// DELETE ROUTE

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findByIdAndDelete(id);

    if (!campground) {
        throw new ExpressError('Campground Not Found', 404);
    }

    res.redirect('/campgrounds');
}));


// CREATE REVIEW ROUTE

app.post(
    '/campgrounds/:id/reviews',
    validateReview,
    catchAsync(async (req, res) => {

        const campground = await Campground.findById(req.params.id);

        if (!campground) {
            throw new ExpressError('Campground Not Found', 404);
        }

        const review = new Review(req.body.review);

        campground.reviews.push(review);

        await review.save();
        await campground.save();

        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// DELETE REVIEW ROUTE
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

// 404 ROUTE

app.all('/{*path}', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});


// ERROR HANDLER

app.use((err, req, res, next) => {

    const { statusCode = 500 } = err;

    if (!err.message) {
        err.message = 'Oh No, Something Went Wrong!';
    }

    res.status(statusCode).render('error', { err });
});


// SERVER

app.listen(3000, () => {
    console.log('Serving on Port 3000!');
});