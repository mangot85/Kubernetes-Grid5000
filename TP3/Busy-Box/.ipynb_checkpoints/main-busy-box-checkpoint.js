//npm init --yes
//npm install express
//npm install ip
//npm install axios

const express = require('express')
const ip = require("ip")

const app = express()
const ipAddress = ip.address()
const ipPort = 3000

app.use(express.json({
    inflate: true,
    limit: '100kb',
    reviver: null,
    strict: true,
    type: 'application/json',
    verify: undefined
}))

///////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.send(`
    <h1>Simple Busy Box</h1>
    <p>&nbsp;</p>
    <h3>Use JSON commands to generate several random numbers, and sort them.</br>
    This is just to make some calculation that takes time.</br>
    In response, you will get to see how long did it take for the busy-box to perform its allocated task.</h3>
    `)
})

app.post('/json', (req, res) => {
    let ans = ""
    let arrRandomNumbers
    let x1, x2
    let t1, t2

    switch (req.body['MessageType']) {
        case 'Command':
            switch (req.body['NodeCommand']) {
                case 'GenerateNumbers':
                    t1 = Date.now()
                    arrRandomNumbers = []
                    for (x1 = 0; x1 < req.body['NumberOfPoints']; x1++) {
                        arrRandomNumbers.push(Math.random())
                    }
                    arrRandomNumbers.sort()
                    x2 = 0
                    arrRandomNumbers.forEach(xx => { x2 += xx })
                    x2 = x2 / arrRandomNumbers.length
                    t2 = Date.now()

                    ans = { 'Average': x2, 'CalculationTime': (t2 - t1), 'NodeIP': `${ipAddress}:${ipPort}` }

                    break
            }

            break

        default:
            ans += ` => Unknown Message Type => ${req.body['MessageType']} !!!`
    }

    res.json({ 'Message': ans })
})

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))