

var map = L.map('map').setView([43.7, -79.4], 12);  // Center the map over Toronto

// Add base map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(map);

var schoolLayer = L.layerGroup()
var parkLayer = L.layerGroup()
var crimeLayer = L.layerGroup().addTo(map);

// Using Bootstrap Icons for the school and park icons to help with the visual representation
var schoolIcon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/school.svg',
    iconSize: [20, 20],     // Size of the icon
    iconAnchor: [16, 32],   // Anchor point of the icon (center bottom)
    popupAnchor: [0, -32]   // Popup offset relative to the icon anchor
});

var parkIcon = L.icon({
    iconUrl: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/icons/tree-fill.svg',
    iconSize: [20, 20],     // Size of the icon
    iconAnchor: [16, 32],   // Anchor point of the icon (center bottom)
    popupAnchor: [0, -32]   // Popup offset relative to the icon anchor
});

// build function to get the trend of the crime rate
function getCrimeRateTrendHtml(crimeRate2022, crimeRate2023) {
    let trendSymbol = crimeRate2023 > crimeRate2022 ? '↑' : '↓';
    let trendColor = crimeRate2023 > crimeRate2022 ? 'red' : 'green';
    return `<span style="color: ${trendColor};">${trendSymbol}</span>`;
}

// build function to generate the popup content
function generatePopupContent(feature) {
    let content = `<h3>${feature.properties.AREA_NAME}</h3><p>Population 2023: ${feature.properties.POPULATION_2023}</p>`;
    const crimes = ['ASSAULT', 'AUTOTHEFT', 'BIKETHEFT', 'BREAKENTER', 'HOMICIDE', 'ROBBERY', 'SHOOTING', 'THEFTFROMMV', 'THEFTOVER'];
    crimes.forEach(crime => {
        let rate2022 = feature.properties[`${crime}_RATE_2022`];
        let rate2023 = feature.properties[`${crime}_RATE_2023`];
        content += `<p>${crime} Rate 2023: ${rate2023} ${getCrimeRateTrendHtml(rate2022, rate2023)}</p>`;
    });
    return content;
}


// Fetch and add the school data
fetch('/schooldata')
    .then(response => response.json())
    .then(data => {
        L.geoJson(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: schoolIcon }), // Use school icon
            onEachFeature: (feature, layer) => {
                const schooltype = feature.properties.schooltype || 'N/A';
                layer.bindPopup(`Name: ${feature.properties.NAME}<br>Type: ${feature.properties.SCHOOL_TYPE_DESC}`);
            }
        }).addTo(schoolLayer);
    });

// Fetch and add the park data
fetch('/parksdata')
    .then(response => response.json())
    .then(data => {
        L.geoJson(data, {
            pointToLayer: (feature, latlng) => L.marker(latlng, { icon: parkIcon }), // Use park icon
            onEachFeature: (feature, layer) => {
                const amenities = feature.properties.AMENITIES || 'N/A';
                layer.bindPopup(`Park Name: ${feature.properties.ASSET_NAME}<br>Amenities: ${amenities}`);
            }
        }).addTo(parkLayer);
    });

// Fetch and add crime data to the map
fetch('/crimedata')
    .then(response => response.json())
    .then(data => {
        data.forEach(geojson => {
            L.geoJson(geojson, {
                style: function(feature) {
                    return {
                        fillColor: getColor(feature.properties.ASSAULT_RATE_2023),
                        color: 'black',  // Border color
                        weight: 1,       // Border width
                        fillOpacity: 0.44 // Fill opacity
                    };
                },
                onEachFeature: function(feature, layer) {
                    let popupContent = generatePopupContent(feature);
                    layer.bindPopup(popupContent);
                }
            }).addTo(crimeLayer);
        });
    });

// Define the color scale function
function getColor(assaultRate) {
    return assaultRate > 1500 ? '#800026' :
           assaultRate > 1100 ? '#BD0026' :
           assaultRate > 900 ? '#E31A1C' :
           assaultRate > 700 ? '#FC4E2A' :
           assaultRate > 500 ? '#FD8D3C' :
           assaultRate > 300 ? '#FEB24C' :
           assaultRate > 100 ? '#FED976' :
                               '#FFEDA0';
}

// Add legend control
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100, 300, 500, 700, 900, 1100, 1500],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        var color = getColor(grades[i] + 1);
        div.innerHTML +=
            '<div style="display: flex; align-items: center;">' +
                '<div style="width: 20px; height: 20px; background-color:' + color + '; margin-right: 5px;"></div>' +
                '<span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+') + '</span>' +
            '</div>';
    }

    return div;
};

legend.addTo(map);

// Add layer control
var overlayMaps = {
    "Schools": schoolLayer,
    "Parks": parkLayer,
    "Crime": crimeLayer
};

L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);
