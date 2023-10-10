import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Overlay from 'ol/Overlay.js';
import { Circle, Point } from 'ol/geom';
import View from 'ol/View.js';
import { Icon, Style, Stroke, Fill } from 'ol/style.js';
import { OGCMapTile, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import OSM from 'ol/source/OSM.js';
import {fromLonLat} from 'ol/proj';


const apiKey = 'AIzaSyANhDjKBjhiCGBlbkCSA-ttdHiKgn0LOyI';
const vectorSource = new VectorSource();

const userLocationStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'user_icon.png',
    scale: 0.5,
  }),
});

function fetchAndUpdateLocations(userCoordinates) {
    const circleRadius = 0.007;
    vectorSource.clear();

      // Display the user's location
      const userFeature = new Feature({
        geometry: new Point(userCoordinates).transform('EPSG:4326', 'EPSG:3857'),
        name: 'Your Location',
    });
    console.log(userCoordinates);
    userFeature.setStyle(userLocationStyle);
    vectorSource.addFeature(userFeature);

    const filter = 'tarihi yerler';
    const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${filter}&key=${apiKey}`;

    fetch(request)
      .then(response => response.json())
      .then(data => {
        const locations = data.results;
        locations.forEach(location => {
          const name = location.name;
          const coordinates = location.geometry.location;

          const iconFeature = new Feature({
            geometry: new Point([coordinates.lng, coordinates.lat]).transform('EPSG:4326', 'EPSG:3857'),
            name: name,
          });
  
          vectorSource.addFeature(iconFeature);

          const locationPoint = [coordinates.lng, coordinates.lat];
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
      .catch(error => {
        console.error('Error:', error);
      });
}

document.getElementById('changeLocationButton').addEventListener('click', function () {
  const newLatitude = parseFloat(document.getElementById('latitude').value);
  const newLongitude = parseFloat(document.getElementById('longitude').value);
  const newUserCoordinates = [newLongitude, newLatitude];

  const circleRadius = 0.007;
  const isInside = isPointInsideCircle(newUserCoordinates, newUserCoordinates, circleRadius);

  if (isInside) {
    console.log('The new location is inside the circular area.');
  } else {
    console.log('The new location is outside the circular area.');
  }

  fetchAndUpdateLocations(newUserCoordinates);
});

function isPointInsideCircle(point, circleCenter, circleRadius) {
    const [pointX, pointY] = point;
    const [centerX, centerY] = circleCenter;

    const distance = Math.sqrt(Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2));
    return distance <= circleRadius;
}

const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: function (feature, resolution) {
        const zoom = map.getView().getZoom();
        const iconScale = Math.min(1, zoom / 10);
        const circleRadius = Math.min(0.01, zoom / 10);

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
        vectorLayer,
    ],
    view: new View({
        projection: 'EPSG:3857',
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

document.getElementById('getUserLocationButton').addEventListener('click', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userCoordinates = [position.coords.longitude, position.coords.latitude];
            fetchAndUpdateLocations(userCoordinates); 
            map.getView().setCenter(fromLonLat(userCoordinates));
            map.getView().setZoom(12);
        }, function (error) {
            console.error('Error obtaining geolocation', error);
        });
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
});

map.on('movestart', disposePopover);