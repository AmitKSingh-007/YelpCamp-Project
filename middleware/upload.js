const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        const uniqueName =
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    }
});

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const fileFilter = (req, file, cb) => {

    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(null, true);
    }

    cb(new Error("Only JPG, PNG and WebP images are allowed."));

}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;