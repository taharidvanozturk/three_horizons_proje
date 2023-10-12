const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/uploadImage', (req, res) => {
    let xmlData = req.body.imageData;

    exec('python C:\\Users\\taha\\PycharmProjects\\pythonProject2\\siganture.py', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.json({ status: "error", message: "Failed to generate signature." });
        }

        const output = stdout.trim().split('\n');
        let current_date = output[0].trim();
        console.log("Current Date:", current_date); 
        console.log("Date Length:", current_date.length); // Log the length
        const signature = output[1];

        var config = {
            method: "put",
            url: "https://btk-maraton.obs.myhuaweicloud.com",
            headers: {
                'Authorization': 'OBS UEZH2HJM6NR0GWUGKTHT:' + signature,
                'Date': current_date,
                Accept: "application/xml",
                'Content-Type': 'application/xml'
            },
            data: xmlData
        };

        axios(config)
            .then(function(response) {
                console.log(JSON.stringify(response.data));
                res.json({ status: "success", message: "Image uploaded successfully." });
            })
            .catch(function(error) {
                console.error(error);
                res.json({ status: "error", message: "Failed to upload image." });
            });
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
