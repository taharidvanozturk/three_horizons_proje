import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import { Circle, Point } from 'ol/geom';
import View from 'ol/View.js';
import { Icon, Style, Stroke, Fill } from 'ol/style.js';
import { OGCMapTile, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import OSM from 'ol/source/OSM.js';

const apiKey = 'AIzaSyANhDjKBjhiCGBlbkCSA-ttdHiKgn0LOyI'; // Replace with your actual API key

const vectorSource = new VectorSource(); // Vector source

const userLocationStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'user_icon.png', // Özel simge dosyasının yolu
    scale: 0.5, // Simgeyi istediğiniz boyuta ölçekleyin
  }),
});

function updateAndDisplayUserLocation() {
  document.getElementById('changeLocationButton').addEventListener('click', function () {
    // Yeni enlem ve boylam değerlerini al
    const newLatitude = parseFloat(document.getElementById('latitude').value);
    const newLongitude = parseFloat(document.getElementById('longitude').value);

    // Yeni konum verilerini kullanarak kullanıcı konumunu güncelle
    const newUserCoordinates = [newLongitude, newLatitude];

    // Çakışma fonksiyonunu çağır ve yeni konumu kontrol et
    const circleRadius = 0.007; // Daire yarıçapını ayarlayın
    const isInside = isPointInsideCircle(newUserCoordinates, userCoordinates, circleRadius);

    if (isInside) {
      console.log('The new location is inside the circular area.');
    } else {
      console.log('The new location is outside the circular area.');
    }
    updateAndDisplayUserLocation();
  });
}

// "Change Location" düğmesine tıklanınca çalışacak işlev
document.getElementById('changeLocationButton').addEventListener('click', function () {
  // Yeni enlem ve boylam değerlerini al
  const newLatitude = parseFloat(document.getElementById('latitude').value);
  const newLongitude = parseFloat(document.getElementById('longitude').value);

  // Yeni konum verilerini kullanarak kullanıcı konumunu güncelle
  const newUserCoordinates = [newLongitude, newLatitude];

  // Çakışma fonksiyonunu çağır ve yeni konumu kontrol et
  const circleRadius = 0.007; // Daire yarıçapını ayarlayın
  const isInside = isPointInsideCircle(newUserCoordinates, newUserCoordinates, circleRadius);

  if (isInside) {
    console.log('The new location is inside the circular area.');
  } else {
    console.log('The new location is outside the circular area.');
  }
});

// Google Places API to fetch locations based on a filter
function getLocationsByFilter() {
  const circleRadius = 0.007; // Define the circle radius here
  
  // Trigger geolocation request in response to a user gesture (e.g., button click)
  const getUserLocationButton = document.getElementById('getUserLocationButton');
  getUserLocationButton.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const userCoordinates = [position.coords.longitude, position.coords.latitude];
      const userFeature = new Feature({
        geometry: new Point(userCoordinates).transform('EPSG:4326', 'EPSG:3857'),
        name: 'Your Location',
      });

      userFeature.setStyle(userLocationStyle);

      vectorSource.addFeature(userFeature);

      // Fetch data from Google Places API
      const filter = 'tarihi yerler'; // Replace with your desired filter

      const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${filter}&key=${apiKey}`;

      fetch(request)
        .then((response) => response.json())
        .then((data) => {
          const locations = data.results;
          locations.forEach((location) => {
            const name = location.name;
            const coordinates = location.geometry.location;

            const iconFeature = new Feature({
              geometry: new Point([coordinates.lng, coordinates.lat]).transform('EPSG:4326', 'EPSG:3857'),
              name: name,
            });

            vectorSource.addFeature(iconFeature);

            const locationPoint = [coordinates.lng, coordinates.lat];

            // Check if the location is inside the circular area around the user
            const isInside = isPointInsideCircle(locationPoint, userCoordinates, circleRadius);

            if (isInside) {
              console.log(`${name} is inside the circular area.`);
            }

            const circleFeature = new Feature({
              geometry: new Circle([coordinates.lng, coordinates.lat], circleRadius).transform('EPSG:4326', 'EPSG:3857'),
              name: name,
            });

            vectorSource.addFeature(circleFeature);
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    });
  });
}

getLocationsByFilter();

const vectorLayer = new VectorLayer({
  source: vectorSource, // Use the vector source to create the layer
  style: function (feature, resolution) {
    const zoom = map.getView().getZoom();
    const iconScale = Math.min(1, zoom / 10); // Adjust the scale factor as needed
    const circleRadius = Math.min(0.01, zoom / 10); // Adjust the circle radius as needed

    return [
      new Style({
        image: new Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          src: 'icon.png',
          scale: iconScale,
        }),
      }),
      new Style({
        geometry: feature.getGeometry(),
        stroke: new Stroke({
          color: 'red',
          width: 2,
        }),
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.2)',
        }),
        radius: circleRadius,
      }),
    ];
  },
});

const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
    crossOrigin: '',
  }),
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer, // Add the vector layer to the map
  ],
  view: new View({
    projection: 'EPSG:3857', // Use the appropriate projection
    center: [0, 0],
    zoom: 3,
  }),
});

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popup);

let popover;

function disposePopover() {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
}

function isPointInsideCircle(point, circleCenter, circleRadius) {
  const [pointX, pointY] = point;
  const [centerX, centerY] = circleCenter;
  
  // Calculate the distance between the point and the circle center
  const distance = Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));

  // Compare the distance to the radius
  return distance <= circleRadius;
}


map.on('click', function (evt) {
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  disposePopover();
  if (!feature) {
    return;
  }
  popup.setPosition(evt.coordinate);
  popover = new bootstrap.Popover(element, {
    placement: 'top',
    html: true,
    content: feature.get('name'),
  });
  popover.show();
});
map.on('movestart', disposePopover,updateAndDisplayUserLocation);
