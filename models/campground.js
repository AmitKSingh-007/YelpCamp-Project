const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema(
    {
        url: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

ImageSchema.virtual("thumbnail").get(function () {
    // Generate a resized Cloudinary thumbnail using URL transformation.

    return this.url.replace("/upload", "/upload/w_250,h_180,c_fill");
});

const CampgroundSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        images: [ImageSchema],
        price: {
            type: Number,
            required: true,
            min: 0
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        geometry: {
            type: {
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Review'
            }
        ]
    },
    {
        timestamps: true
    }
);

CampgroundSchema.index({
    geometry: "2dsphere"
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);