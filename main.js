import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import { Circle, Point } from "ol/geom";
import View from "ol/View.js";
import { Icon, Style, Stroke, Fill } from "ol/style.js";
import { OGCMapTile, Vector as VectorSource } from "ol/source.js";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer.js";
import OSM from "ol/source/OSM.js";
import { fromLonLat } from "ol/proj";


let currentLocationName = ""; 

document.addEventListener("DOMContentLoaded", function () {
	document.getElementById("cameraFeed").style.display = "block";

	// Kamera erişimi
	function accessCamera() {
		const video = document.getElementById("cameraFeed");
		if (!video) {
			console.error("cameraFeed element not found!");
			return;
		}

		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			navigator.mediaDevices
				.getUserMedia({ video: true })
				.then(function (stream) {
					video.srcObject = stream;
					video.play();
				})
				.catch(function (error) {
					console.error("Error accessing the camera:", error);
				});
		} else {
			console.error("getUserMedia not supported!");
		}
	}
	accessCamera();
	const capturePhotoButton = document.getElementById("capturePhoto");
	if (capturePhotoButton) {
		capturePhotoButton.addEventListener("click", function () {
			const video = document.getElementById("cameraFeed");
			const canvas = document.getElementById("photoCanvas");
			if (canvas) {
				const context = canvas.getContext("2d");
				const aspectRatio = video.videoWidth / video.videoHeight;
				const width = 300;
				const height = width / aspectRatio;
				context.drawImage(video, 0, 0, width, height);
				const dataURL = canvas.toDataURL();
		
				sendImageDataToServer(dataURL, currentLocationName); // Move this line here after dataURL is defined
		
				const link = document.createElement("a");
				link.download = "photo.png";
				link.href = dataURL;
				link.click();
				const photoElement = document.createElement("img");
				photoElement.src = dataURL;
				document.body.appendChild(photoElement);
	
			}
		});
	}
	function sendImageDataToServer(imageData, locationName) {
		axios.post('http://localhost:3000/upload', {
			image: imageData,
			location: locationName
		})
		.then(response => {
			console.log(response);
		})
		.catch(error => {
			console.log("Error uploading image:", error);
		});
	}
	const stopVideoButton = document.getElementById("stopVideo");
	if (stopVideoButton) {
		stopVideoButton.addEventListener("click", function () {
			const video = document.getElementById("cameraFeed");
			if (video) {
				const stream = video.srcObject;
				if (stream) {
					const tracks = stream.getTracks();
					tracks.forEach(function (track) {
						track.stop();
					});
					video.srcObject = null;
				}
			}
		});
	}
	const startVideoButton = document.getElementById("startVideo");
	if (startVideoButton) {
		startVideoButton.addEventListener("click", function () {
			const video = document.getElementById("cameraFeed");
			if (video) {
				navigator.mediaDevices
					.getUserMedia({ video: true })
					.then(function (stream) {
						video.srcObject = stream;
						video.play();
					})
					.catch(function (error) {
						console.error("Error accessing media devices.", error);
					});
			}
		});
	}
	// Kamera erişimini başlat

	var puan = 0;
	const apiKey = "AIzaSyANhDjKBjhiCGBlbkCSA-ttdHiKgn0LOyI";
	const vectorSource = new VectorSource();

	document.addEventListener("DOMContentLoaded", function () {
		const popoverTriggerList = [].slice.call(
			document.querySelectorAll('[data-bs-toggle="popover"]')
		);
		const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
			return new bootstrap.Popover(popoverTriggerEl);
		});
	});

	const userLocationStyle = new Style({
		image: new Icon({
			anchor: [0.5, 1],
			anchorXUnits: "fraction",
			anchorYUnits: "pixels",
			src: "user_icon.png",
			scale: 0.6,
		}),
	});

	function fetchAndUpdateLocations(userCoordinates) {
		const circleRadius = 0.006;
		vectorSource.clear();

		// Display the user's location
		const userFeature = new Feature({
			geometry: new Point(userCoordinates).transform("EPSG:4326", "EPSG:3857"),
			name: "Şu Anda Buradasınız.",
		});
		console.log(userCoordinates);
		userFeature.setStyle(userLocationStyle);
		vectorSource.addFeature(userFeature);

		const filter = "tarihi yerler";
		const request = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${filter}&key=${apiKey}`;

		fetch(request)
			.then((response) => response.json())
			.then((data) => {
				const locations = data.results;
				locations.forEach((location) => {
					const name = location.name;
					const coordinates = location.geometry.location;

					const iconFeature = new Feature({
						geometry: new Point([coordinates.lng, coordinates.lat]).transform(
							"EPSG:4326",
							"EPSG:3857"
						),
						name: name,
					});

					vectorSource.addFeature(iconFeature);

					const locationPoint = [coordinates.lng, coordinates.lat];
					const isInside = isPointInsideCircle(
						userCoordinates,
						locationPoint,
						circleRadius
					);

					function setPopoverContent(element, content) {
						let popoverInstance = bootstrap.Popover.getInstance(element);
						if (popoverInstance) {
							popoverInstance.config.content = content;
							popoverInstance.update();
						} else {
							console.error(
								"Popover instance not found for the given element."
							);
							// Initialize popoverInstance here if necessary
						}
					}

					if (isInside) {
						currentLocationName = name;
						console.log(`${name} is inside the circular area.`);

						const popoverElement = document.getElementById("insidePopover");

						// Video beslemesi ve fotoğraf çekme düğmesini pop-up içeriğine ekleyin
						const cameraContent = `
			<video id="cameraFeed" width="300" autoplay></video>
			<button id="capturePhoto" class="btn btn-warning" onclick="captureImage()">Fotoğraf Çek</button>
			<canvas id="photoCanvas" style="display:none;" width="300"></canvas>
			Tebrikler! ${name} Alanına Geldiniz ve 10 Puan Kazandınız. Fotoğraf Çekerek 20 Puan Daha Kazanabilirsiniz
		`;

						// Kamera erişimini başlat
						accessCamera();

						// Directly create a new instance of popover and configure its content
						const popoverInstance = new bootstrap.Popover(popoverElement, {
							content: cameraContent,
							container: "body",
							html: true,
							title: "Location Information",
							placement: "top",
							trigger: "manual", // this ensures the popover is controlled programmatically
						});
						puan = puan + 10;
						console.log(puan);

						// Show the popover
						popoverInstance.show();
					}

					const circleFeature = new Feature({
						geometry: new Circle(
							[coordinates.lng, coordinates.lat],
							circleRadius
						).transform("EPSG:4326", "EPSG:3857"),
						name: name,
					});

					vectorSource.addFeature(circleFeature);
				});
			})
			.catch((error) => {
				console.error("Error:", error);
			});
	}

	document
		.getElementById("changeLocationButton")
		.addEventListener("click", function () {
			const newLatitude = parseFloat(document.getElementById("latitude").value);
			const newLongitude = parseFloat(
				document.getElementById("longitude").value
			);
			const newUserCoordinates = [newLongitude, newLatitude];

			const circleRadius = 0.006;
			const isInside = isPointInsideCircle(
				newUserCoordinates,
				newUserCoordinates,
				circleRadius
			);
			fetchAndUpdateLocations(newUserCoordinates);
		});

	function isPointInsideCircle(point, circleCenter, circleRadius) {
		const [pointX, pointY] = point;
		const [centerX, centerY] = circleCenter;

		const distance = Math.sqrt(
			Math.pow(pointX - centerX, 2) + Math.pow(pointY - centerY, 2)
		);
		return distance <= circleRadius;
	}

	const vectorLayer = new VectorLayer({
		source: vectorSource,
		style: function (feature, resolution) {
			const zoom = map.getView().getZoom();
			const iconScale = Math.min(1, zoom / 50);
			const circleRadius = Math.min(0.01, zoom / 50);

			return [
				new Style({
					image: new Icon({
						anchor: [0.5, 0.5],
						anchorXUnits: "fraction",
						anchorYUnits: "pixels",
						src: "icon.png",
						scale: iconScale,
					}),
				}),
				new Style({
					geometry: feature.getGeometry(),
					stroke: new Stroke({
						color: "red",
						width: 2,
					}),
					fill: new Fill({
						color: "rgba(255, 0, 0, 0.2)",
					}),
					radius: circleRadius,
				}),
			];
		},
	});

	const rasterLayer = new TileLayer({
		source: new OGCMapTile({
			url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad",
			crossOrigin: "",
		}),
	});

	const map = new Map({
		target: "map",
		layers: [
			new TileLayer({
				source: new OSM(),
			}),
			vectorLayer,
		],
		view: new View({
			projection: "EPSG:3857",
			center: [0, 0],
			zoom: 12,
		}),
	});

	const element = document.getElementById("popup");
	const popup = new Overlay({
		element: element,
		positioning: "bottom-center",
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

	map.on("click", function (evt) {
		const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
			return feature;
		});

		disposePopover();
		if (!feature) {
			return;
		}

		popup.setPosition(evt.coordinate);
		popover = new bootstrap.Popover(element, {
			placement: "top",
			html: true,
			content: feature.get("name"),
		});

		popover.show();
	});

	document
		.getElementById("getUserLocationButton")
		.addEventListener("click", function () {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						const userCoordinates = [
							position.coords.longitude,
							position.coords.latitude,
						];
						fetchAndUpdateLocations(userCoordinates);
						map.getView().setCenter(fromLonLat(userCoordinates));
						map.getView().setZoom(12);
					},
					function (error) {
						console.error("Error obtaining geolocation", error);
					}
				);
			} else {
				console.error("Geolocation is not supported by this browser.");
			}
		});

	map.on("movestart", disposePopover);
});
