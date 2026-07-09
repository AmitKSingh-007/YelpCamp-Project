const Campground = require('../models/campground');

const { uploadImage, deleteImage } = require("../services/imageService");

const { geocodeLocation } = require("../services/geocodingService");

module.exports.index = async (req, res) => {

    const campgrounds = await Campground.find({});

    const mapData = campgrounds.map(campground => ({
        _id: campground._id,
        title: campground.title,
        location: campground.location,
        geometry: campground.geometry
    }));

    res.render('campgrounds/index', { campgrounds, mapData });
};

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res) => {

    const uploadedImages = [];

    try {

        const campground = new Campground(req.body.campground);

        campground.author = req.user._id;

        campground.geometry = await geocodeLocation(campground.location);

        for (const file of req.files) {
            const image = await uploadImage(file.path)
            uploadedImages.push(image);
        }

        campground.images = uploadedImages;

        await campground.save();

        req.flash('success', 'Successfully created a new campground!');

        res.redirect(`/campgrounds/${campground._id}`);

    } catch (err) {

        for (const image of uploadedImages) {
            try {
                await deleteImage(image.filename);
            } catch (rollbackErr) {
                console.error(
                    `Rollback failed for ${image.filename}:`,
                    rollbackErr.message
                );
            }
        }

        throw err;

    }


};

module.exports.showCampground = async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {

    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });

};

module.exports.updateCampground = async (req, res) => {

    const uploadedImages = [];

    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {

        req.flash("error", "Campground Not Found");

        return res.redirect("/campgrounds");

    }

    const oldLocation = campground.location;

    Object.assign(campground, req.body.campground);

    try {

        if (oldLocation !== campground.location) {
            campground.geometry = await geocodeLocation(campground.location);
        }

        for (const file of req.files) {
            const image = await uploadImage(file.path)
            uploadedImages.push(image);
        }

        campground.images.push(...uploadedImages);

    } catch (err) {

        for (const image of uploadedImages) {
            try {
                await deleteImage(image.filename);
            } catch (rollbackErr) {
                console.error(
                    `Rollback failed for ${image.filename}:`,
                    rollbackErr.message
                );
            }
        }

        throw err;

    }

    const deleteImages = req.body.deleteImages || [];

    if (deleteImages.length) {

        const imagesToDelete = campground.images.filter(image =>
            deleteImages.includes(image.filename)
        );

        for (const image of imagesToDelete) {
            await deleteImage(image.filename);
        }

        campground.images = campground.images.filter(
            image => !deleteImages.includes(image.filename)
        );
    }

    await campground.save();

    req.flash('success', 'Successfully updated the campground!');

    res.redirect(`/campgrounds/${campground._id}`);

};

module.exports.deleteCampground = async (req, res) => {

    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
        req.flash('error', 'Campground Not Found');
        return res.redirect('/campgrounds');
    }

    for (const image of campground.images) {
        await deleteImage(image.filename);
    }

    await Campground.findByIdAndDelete(id);

    req.flash('success', 'Successfully deleted the campground!');
    res.redirect('/campgrounds');


};
