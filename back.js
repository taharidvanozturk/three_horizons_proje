const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');

// Your Access Key and Secret Key
let accessKey = 'RHNJIZWSOXKFCUDZYMDX';
let secretKey = 'KNxGGXzXb4AElaRbr0zga5xIazFGsqUGDehj4wO6';

let data = fs.readFileSync('C:/Users/taha/Desktop/bir_huawei_laptopa_ihtiyacim_var/biat_degil_ibadet_edeceksiniz.txt', 'utf8');

// Calculate the signature
let stringToSign = 'PUT\n\n' + 'text/plain\n' + new Date().toUTCString() + '\n/btk-maraton/object01';
let hmac = crypto.createHmac('sha1', secretKey);
hmac.update(stringToSign);
let signature = hmac.digest('base64');

axios({
  method: 'put',
  url: 'https://btk-maraton.obs.tr-west-1.myhuaweicloud.com/object01',
  headers: { 
    'Content-Type': 'text/plain',
    'Authorization': 'OBS ' + accessKey + ':' + signature,
    'Date': new Date().toUTCString()
  },
  data : data
})
.then(function (response) {
  console.log(response);
})
.catch(function (error) {
  console.log(error);
});
