const maptilerClient = require("@maptiler/client");
const ExpressError = require("../utils/ExpressError");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

async function geocodeLocation(location) {
    try {
        const response = await maptilerClient.geocoding.forward(
            location,
            {
                limit: 1
            }

        );

        if (!response.features || response.features.length === 0) {
            throw new ExpressError("Location not found", 400);
        }

        return response.features[0].geometry;

    } catch (err) {
        if (err instanceof ExpressError) throw err;

        err.message = `Geocoding failed: ${err.message}`;
        throw err;
    }
}

module.exports = {
    geocodeLocation
};