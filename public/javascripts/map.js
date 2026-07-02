// ----------------------------
// Coordinates
// ----------------------------

const coordinates = mapData.geometry.coordinates;

const latLng = [
    coordinates[1],
    coordinates[0]
];

// ----------------------------
// Map
// ----------------------------

const map = L.map("map").setView(latLng, 10);

L.tileLayer(
    `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`,
    {
        attribution: "&copy; MapTiler &copy; OpenStreetMap contributors"
    }
).addTo(map);

// ----------------------------
// Marker
// ----------------------------

L.marker(latLng)
    .addTo(map)
    .bindPopup(`
        <strong>${mapData.title}</strong><br>
        ${mapData.location ?? ""}
    `)
    .openPopup();