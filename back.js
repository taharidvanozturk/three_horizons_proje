const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const cors = require("cors");
const app = express();
let currentTime = new Date().toUTCString();
app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());
app.post('/setCurrentTime', (req, res) => {
    let receivedDate = new Date(req.body.currentTime);
    let adjustedDate = new Date(receivedDate.getTime() + 3 * 60 * 60 * 1000); // 3 saat ekleniyor
    currentTime = adjustedDate.toUTCString();
    console.log("Received and Converted Current Time:", currentTime);
    res.send({ status: 'success' });
});
console.log("Current Time:", currentTime);
// Your Access Key and Secret Key
const accessKey = "UEZH2HJM6NR0GWUGKTHT";
const secretKey = "b9fp5CZh6iwZDDuC0CN6DKeuRIx5n5o6uMDBoYVC";

let counter = 1; // Sayaç başlangıcı

app.post("/upload", (req, res) => {
    if(!currentTime) {
        return res.status(400).send("currentTime is not set yet.");
    }
    console.log("Received request at /upload with data:", req.body);
    let image = req.body.image;
    let locationName = req.body.location;

    let data = Buffer.from(image.split(",")[1], "base64");
    let objectName = locationName + ".png";

    uploadToOBS(data, objectName);
    res.send("Image uploaded successfully.");
});

function uploadToOBS(data, objectName) {
    let stringToSign =
        "PUT\n\n" +
        "image/png\n" +
        currentTime + // Güncellenmiş zamanı burada kullan
        "\n/btk-maraton/" +
        objectName;
    let hmac = crypto.createHmac("sha1", secretKey);
    hmac.update(stringToSign);
    let signature = hmac.digest("base64");

    axios({
        method: "put",
        url: `https://btk-maraton.obs.tr-west-1.myhuaweicloud.com/${objectName}`,
        headers: {
            "Content-Type": "image/png",
            Authorization: "OBS " + accessKey + ":" + signature,
            Date: currentTime,
        },
        data: data,
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
