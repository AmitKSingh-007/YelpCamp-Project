const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body.user;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);

            req.flash('success', 'Welcome to YelpCamp!');
            res.redirect('/campgrounds');
        })
    } catch (err) {
        if (err.name === "UserExistsError") {
            req.flash("error", err.message);
            return res.redirect("/register");
        }

        return next(err);
    }
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }

        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};