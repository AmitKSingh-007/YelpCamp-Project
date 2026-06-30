const cloudinary = require('../utils/cloudinary');

const fs = require("fs/promises");

async function uploadImage(filePath) {
    try {

        const result = await cloudinary.uploader.upload(filePath, {
            folder: "YelpCamp"
        });

        return {
            url: result.secure_url,
            filename: result.public_id
        }

    } catch (err) {

        throw new Error(`Cloudinary upload failed: ${err.message}`);

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

        throw new Error(`Cloudinary delete failed: ${err.message}`);

    }
}

module.exports = {
    uploadImage,
    deleteImage
};