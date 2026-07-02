const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

async function geocodeLocation(location) {
    const response = await maptilerClient.geocoding.forward(
        location,
        {
            limit: 1
        }

    );

    if (response.features.length === 0) {
        throw new ExpressError("Location not found", 400);
    }

    return response.features[0].geometry;
}

module.exports = {
    geocodeLocation
};