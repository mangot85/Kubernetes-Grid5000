const { execSync } = require('child_process')
const axios = require('axios')
const urlAutoScaler = 'http://localhost:5000/json'
const urlLoadGenerator = 'http://localhost:4000/json'

let RequestInterval
let TargetDelay

var myArgs = process.argv.slice(2)
if (myArgs[0] == null) {
    console.log('Please provide RequestInterval and TargetDelay')
    return
} else {
    RequestInterval = myArgs[0]
    TargetDelay = myArgs[1]

    console.log(`Run test for RequestInterval: ${RequestInterval} to reach TargetDelay: ${TargetDelay}`)
}


function sendAxiosPost(url, dataObj) {
    axios.post(url, dataObj)
        .then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            //console.log(err);
            console.log('<=== ERROR ===>');
        })
}


console.log(`Execute => kubectl scale --replicas=1 -f k8-tp-03-busy-box-deployment.yaml`)
execSync(`kubectl scale --replicas=1 -f k8-tp-03-busy-box-deployment.yaml`)

sendAxiosPost(urlLoadGenerator, {
    MessageType: 'Setting',
    UrlBusyBox: 'http://192.168.49.2:30100/json'
})

sendAxiosPost(urlAutoScaler, {
    MessageType: 'Command',
    NodeCommand: 'BuildLookupTable',
})


setTimeout(() => {
    sendAxiosPost(urlLoadGenerator, {
        MessageType: 'Command',
        NodeCommand: 'GenerateLoad',
        Duration: 100000, //10000ms = 10s
        Interval: RequestInterval, // 100 = 100 ms
        NumberOfPoints: 4000,
        TargetDelay: TargetDelay
    })

    sendAxiosPost(urlAutoScaler, {
        MessageType: 'Command',
        NodeCommand: 'AutoScale',
        RequestInterval: RequestInterval,
        TotalDelay: TargetDelay
    })

}, 5000)

