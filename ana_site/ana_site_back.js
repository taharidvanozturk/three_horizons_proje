const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const { createHmac } = require("crypto");
const app = express();

const accessKey = "UEZH2HJM6NR0GWUGKTHT";
const secretKey = "b9fp5CZh6iwZDDuC0CN6DKeuRIx5n5o6uMDBoYVC";

// Define currentTime as GMT+3
const currentTimeOffset = 3; // Adjust this offset as needed
let currentTime = new Date();
currentTime.setUTCHours(currentTime.getUTCHours() + currentTimeOffset);
currentTime = currentTime.toUTCString();
console.log("Current Time:", currentTime);
app.get('/getImagesList/.png', (req, res) => {
    let objectName =".png";
    fetchFromOBS(currentTime, objectName, res);
});

function fetchFromOBS(currentTime, objectName, res) {
    let stringToSign =
        "GET\n\n" +
        "\n" +
        currentTime +
        "\n/btk-maraton/" +
        objectName;

    let hmac = createHmac("sha1", secretKey);
    hmac.update(stringToSign);
    let signature = hmac.digest("base64");

    console.log("Preparing to fetch image:", objectName);

    axios({
        method: "get",
        url: `https://btk-maraton.obs.tr-west-1.myhuaweicloud.com/${objectName}`,
        headers: {
    'Content-Type': 'image/png',  // Corrected Content-Type header
            Authorization: "OBS " + accessKey + ":" + signature,
            Date: currentTime,
        },
        responseType: 'stream'  // important to set this for streaming
    })
    .then(function (response) {
        console.log("Received response from OBS:", response.status);
        
        // pipe the image data directly to the client
        response.data.pipe(res);
    })
    .catch(function (error) {
        console.error("Error fetching the image:", error);
        res.status(500).send('Failed to fetch the image.');
    });
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

console.log("Server started.");
