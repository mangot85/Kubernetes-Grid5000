const axios = require('axios');
//const urlBusyBox = 'http://localhost:3000/json'
const urlBusyBox = 'http://192.168.49.2:30100/json'


function sendAxiosPost(url, dataObj) {
    axios.post(url, dataObj)
        .then((res) => {
            //console.log(dataObj)
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
}
sendAxiosPost(urlBusyBox, {
    MessageType: 'Command',
    NodeCommand: 'GenerateNumbers',
    NumberOfPoints: 100000
})
