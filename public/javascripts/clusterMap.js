const map = L.map("map");

map.scrollWheelZoom.disable();

L.tileLayer(
    `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`,
    {
        attribution: "&copy; MapTiler &copy; OpenStreetMap contributors"
    }
).addTo(map);

const bounds = L.latLngBounds();

const markerCluster = L.markerClusterGroup();

mapData.forEach(campground => {
    const coordinates = campground.geometry.coordinates;

    const latLng = [
        coordinates[1],
        coordinates[0]
    ];

    const marker = L.marker(latLng)
                    .bindPopup(`
                        <strong>${campground.title}</strong><br>
                        📍 ${campground.location}<br>
                        <a href="/campgrounds/${campground._id}">
                            View Details →
                        </a>
                    `);

    markerCluster.addLayer(marker);   

    bounds.extend(latLng);
});

map.addLayer(markerCluster);

if (bounds.isValid()) {
    map.fitBounds(bounds);
} else {
    map.setView([20, 0], 2); // Default world view
}