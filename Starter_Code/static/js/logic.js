// Store our API endpoint as queryUrl
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  // Pass the features array to the createFeatures function
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  // Define a function to assign colors based on earthquake depth
  function getColor(depth) {
    if (depth > 90) {
      return "#ff5f65";
    } else if (depth > 70) {
      return "#fca35d";
    } else if (depth > 50) {
      return "#fdb72a";
    } else if (depth > 30) {
      return "#f7db11";
    } else if (depth > 10) {
      return "#dcf400";
    } else {
      return "#a3f600";
    }
  }
  // Function to bind popups to each feature
  function onEachFeature(feature, layer) {
    layer.bindPopup(
      `<h3>${feature.properties.place}</h3>
      <hr>
      <p>Magnitude: ${feature.properties.mag}</p>
      <p>Depth: ${feature.geometry.coordinates[2]} km</p>`
    );
  }

  // Create a GeoJSON layer containing the features array
  const earthquakes = L.geoJSON(earthquakeData, {
    // Use circle markers for each earthquake
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: feature.properties.mag * 3, 
        fillColor: getColor(feature.geometry.coordinates[2]), // Color by depth
        color: "#000", // Black border
        weight: 1,
        fillOpacity: 0.9,
      });
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        `<strong>Location:</strong> ${feature.properties.place}<br>
         <strong>Magnitude:</strong> ${feature.properties.mag}<br>
         <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`
      );
    },
  });

  // Pass the earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define the base layer (street map)
  const street = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  });
  const lightMap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  });

  const darkMap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "&copy; CartoDB contributors",
  });

  // Define the base map object
  const baseMaps = {
    "Street Map": street,
    "Light Map": lightMap,
    "Dark Map": darkMap,
  };

  // Define the overlay object to hold our overlay layer
  const overlayMaps = {
    Earthquakes: earthquakes,
  };

  // Create the map, centering it on the USA
  const myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [lightMap, street, earthquakes], 
  });

  // Add a layer control to toggle between datasets
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false,
  }).addTo(myMap);

  // Add a legend to the map
  const legend = L.control({ position: "bottomright" });

  legend.onAdd = function () {
    const div = L.DomUtil.create("div", "info legend");
    const depthRanges = [-10, 10, 30, 50, 70, 90];
    const colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];

  // Add a title to the legend box
  div.innerHTML = "<h4>Earthquake Depth (km)</h4>";

    // Loop through the depth intervals to generate a label with a colored square for each interval
    for (let i = 0; i < depthRanges.length; i++) {
      div.innerHTML += `
        <div style="display: flex; align-items: center; margin-bottom: 5px;">
        <i style="display: inline-block; width: 20px; height: 20px; background: ${colors[i]}; margin-right: 10px;"></i>
          ${depthRanges[i]}${depthRanges[i + 1] ? "&ndash;" + depthRanges[i + 1] : "+"}
        </div>
      `;
    }
  
    return div;
  };

  legend.addTo(myMap);
}


