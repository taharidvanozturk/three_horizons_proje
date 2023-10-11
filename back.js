const express = require('express');
const bodyParser = require('body-parser');
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const cors = require('cors');
const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

// Your Access Key and Secret Key
const accessKey = "RHNJIZWSOXKFCUDZYMDX";
const secretKey = "KNxGGXzXb4AElaRbr0zga5xIazFGsqUGDehj4wO6";

app.post('/upload', (req, res) => {
	console.log("Received request at /upload with data:", req.body);
    let image = req.body.image;
    let locationName = req.body.location;

    let data = Buffer.from(image.split(",")[1], 'base64');
    let objectName = locationName + '.png';
    
    uploadToOBS(data, objectName);
    res.send("Image uploaded successfully.");
});

function uploadToOBS(data, objectName) {
    let stringToSign = "PUT\n\n" + "image/png\n" + new Date().toUTCString() + "\n/btk-maraton/" + objectName;
    let hmac = crypto.createHmac('sha1', secretKey);
    hmac.update(stringToSign);
    let signature = hmac.digest('base64');

    axios({
        method: 'put',
        url: `https://btk-maraton.obs.tr-west-1.myhuaweicloud.com/${objectName}`,
        headers: {
            'Content-Type': 'image/png',
            'Authorization': "OBS " + accessKey + ":" + signature,
            'Date': new Date().toUTCString(),
        },
        data: data
    })
    .then(function(response) {
        console.log(response);
    })
    .catch(function(error) {
        console.log(error);
    });
}

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

// This is the second part of your code, that reads a file and sends it to Huawei Cloud OBS.
let data = fs.readFileSync("C:/Users/taha/Desktop/bir_huawei_laptopa_ihtiyacim_var/biat_degil_ibadet_edeceksiniz.txt", "utf8");
let stringToSign = "PUT\n\n" + "text/plain\n" + new Date().toUTCString() + "\n/btk-maraton/object01";
let hmac = crypto.createHmac("sha1", secretKey);
hmac.update(stringToSign);
let signature = hmac.digest("base64");

axios({
    method: "put",
    url: "https://btk-maraton.obs.tr-west-1.myhuaweicloud.com/object01",
    headers: {
        "Content-Type": "text/plain",
        Authorization: "OBS " + accessKey + ":" + signature,
        Date: new Date().toUTCString(),
    },
    data: data,
})
.then(function (response) {
    console.log(response);
})
.catch(function (error) {
    console.log(error);
});
