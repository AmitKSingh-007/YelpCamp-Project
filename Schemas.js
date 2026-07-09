const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');


const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) {
                    return helpers.error('string.escapeHTML', { value })
                }
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().trim().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().trim().required().escapeHTML(),
        description: Joi.string().trim().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
        .items(Joi.string())
        .single()
        .default([])
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().trim().required().escapeHTML()
    }).required()
});

module.exports.userRegisterSchema = Joi.object({
    user: Joi.object({
        email: Joi.string()
            .trim()
            .email()
            .required()
            .escapeHTML(),

        username: Joi.string()
            .trim()
            .min(3)
            .max(30)
            .required()
            .escapeHTML(),

        password: Joi.string()
            .min(8)
            .max(128)
            .required()
    }).required()
});

module.exports.userLoginSchema = Joi.object({
    username: Joi.string()
        .trim()
        .required()
        .escapeHTML(),

    password: Joi.string()
        .required()
});