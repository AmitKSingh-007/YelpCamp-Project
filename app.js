if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ quiet: true });
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const helmet = require('helmet');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const Campground = require("./models/campground.js");
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const { MongoStore } = require('connect-mongo');

//ROUTES EXPORT
const campgroundRoutes = require('./routes/campground.js');
const reviewRoutes = require('./routes/reviews.js');
const userRoutes = require('./routes/users.js');

const app = express();

app.disable("x-powered-by");

app.set('query parser', 'extended');

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.set('strictQuery', true);

//Local Host: 'mongodb://127.0.0.1:27017/yelp-camp'
async function connectDB() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Database Connected");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

connectDB();

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sanitizeV5({ replaceWith: '_' }));

//SESSION CONFIG


const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.STORE_SECRET
    }
})

store.on("error", (err) => {
    console.log("SESSION STORE ERROR", err)
})

if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is missing");
}

const sessionConfig = {
    store,
    name: "yelpcamp.sid",
    secret: process.env.SESSION_SECRET, //Add secret in env file
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
    sessionConfig.cookie.secure = true;
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

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];

const connectSrcUrls = [
    "https://api.maptiler.com/",
];

const fontSrcUrls = [
    "https://fonts.gstatic.com/",
    "https://cdn.jsdelivr.net/",
];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],

            baseUri: ["'self'"],

            connectSrc: [
                "'self'",
                ...connectSrcUrls,
            ],

            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                ...scriptSrcUrls,
            ],

            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                ...styleSrcUrls,
            ],

            workerSrc: [
                "'self'",
                "blob:",
            ],

            objectSrc: [],

            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com",
                "https://images.unsplash.com",
                "https://api.maptiler.com",
                "https://cdn.jsdelivr.net",
            ],

            fontSrc: [
                "'self'",
                ...fontSrcUrls,
            ],
        },
    })
);


// HOME ROUTE

app.get('/', async (req, res) => {

    const featuredCampgrounds = await Campground.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .lean()

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serving on Port ${PORT}!`);
});