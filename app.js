if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ quiet: true });
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./Utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const Campground = require("./models/campground.js");

//ROUTES EXPORT
const campgroundRoutes = require('./routes/campground.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');

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
app.use(express.static(path.join(__dirname, 'public')));

//SESSION CONFIG

const sessionConfig = {
    secret: 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//FLASH

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// HOME ROUTE

app.get('/', async (req, res) => {

    const featuredCampgrounds = await Campground.find({})
        .sort({ createdAt: -1 })
        .limit(3);

    res.render("campgrounds/home", { featuredCampgrounds });
});

//CAMPGROUND ROUTES

app.use('/campgrounds', campgroundRoutes);

//REVIEW ROUTES

app.use('/campgrounds/:id/reviews', reviewRoutes);

//USER ROUTES

app.use('/', userRoutes);

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