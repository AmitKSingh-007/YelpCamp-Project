const cloudinary = require('../utils/cloudinary');

const fs = require("fs/promises");

async function uploadImage(filePath) {
    try {

        const result = await cloudinary.uploader.upload(filePath, {
            folder: process.env.CLOUDINARY_FOLDER
        });

        return {
            url: result.secure_url,
            filename: result.public_id,
        }

    } catch (err) {

        err.message = `Cloudinary upload failed: ${err.message}`;
        throw err;

    } finally {

        try {
            await fs.unlink(filePath);
        } catch (err) {
            console.error("Failed to delete temporary file: ", err.message);
        }


    }
}

async function deleteImage(publicId) {

    try {

        await cloudinary.uploader.destroy(publicId);

    } catch (err) {

        err.message = `Cloudinary delete failed: ${err.message}`;
        throw err;

    }
}

module.exports = {
    uploadImage,
    deleteImage
};