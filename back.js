var axios = require('axios');
var data = '';

var config = {
    method: 'put',
    url: 'https://obs.tr-west-1.myhuaweicloud.com/taha_deneme?bucket_name=btk-maraton',
    headers: { 
        'Authorization': '<Your signed string>'
    },
    data : data
};

axios(config)
.then(function (response) {
    console.log(JSON.stringify(response.data));
})
.catch(function (error) {
    console.log(error);
});
