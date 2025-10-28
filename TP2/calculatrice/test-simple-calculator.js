const axios = require('axios');
const urlCalculator = 'http://localhost:3000/json'
//const urlCalculator = 'http://192.168.49.2:31842/json'


function sendAxiosPost(url, dataObj) {
    axios.post(url, dataObj)
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            console.log(err);
        })
}
sendAxiosPost(urlCalculator, {
    MessageType: 'Command',
    NodeCommand: 'Add',
    Numbers: [1, 2, 3, 4]
    //Answer => 1 + 2 + 3 + 4 = 10
})

sendAxiosPost(urlCalculator, {
    MessageType: 'Command',
    NodeCommand: 'Subtract',
    Numbers: [1, 2, 3, 4]
    //Answer => 1 - 2 - 3 - 4 = -8
})

sendAxiosPost(urlCalculator, {
    MessageType: 'Command',
    NodeCommand: 'Multiply',
    Numbers: [1, 2, 3, 4]
    //Answer => 1 * 2 * 3 * 4 = 24
})

sendAxiosPost(urlCalculator, {
    MessageType: 'Command',
    NodeCommand: 'Divide',
    Numbers: [1, 2, 3, 4, 5]
    //Answer => 1 / 2 / 3 / 4 / 5 = 0.0083333
})
