const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./Utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

//ROUTES EXPORT
const campgrouds = require('./routes/campground.js');
const reviews = require('./routes/reviews.js');

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

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// HOME ROUTE

app.get('/', (req, res) => {
    res.send('Hello from YelpCamp!!');
});

//CAMPGROUND ROUTES

app.use('/campgrounds', campgrouds);

//REVIEW ROUTES

app.use('/campgrounds/:id/reviews', reviews);

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