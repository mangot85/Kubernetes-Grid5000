//npm init --yes
//npm install express
//npm install ip
//npm install axios

const express = require('express')
const ip = require('ip')

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

///////////////////////////////////////////////////////////
app.get('/', (req, res) => {
    res.send(`
    <h1>Simple Calculator Service</h1>
    <p>&nbsp;</p>
    <h2>Use JSON commands to use the calculator</h2>
    `)
})

const calculate = (operation,numbers) => {numbers.reduce((accumulator, currentValue) => accumulator + currentValue)}

app.post('/json', (req, res) => {
    //Write this section

    let ans = 'N/A'

    const messageType = req.body['MessageType']
    const command = req.body['NodeCommand']
    const numbers = req.body['Numbers']
    
    if(messageType !== 'Command'){
        ans = `${messageType} is not a valid message type`
    }else{
        if(numbers.length == 0){
            ans = `No number to process`
        }else{
            let result = 0
            switch(command) {
                case 'Add':
                    ans = numbers.reduce((accumulator, currentValue) => accumulator + currentValue).toString();
                    break
                case 'Subtract':
                    ans = numbers.reduce((accumulator, currentValue) => accumulator - currentValue).toString();
                    break
                case 'Divide':
                    if(numbers.slice(1).includes(0)) {
                        ans = "Cannot divide by 0"
                    }else{
                        ans = numbers.reduce((accumulator, currentValue) => accumulator / currentValue).toString();
                    }
                    
                    break
                case 'Multiply':
                    ans = numbers.reduce((accumulator, currentValue) => accumulator * currentValue).toString();
                    break
              default:
                ans = `${req.body['NodeCommand']} is not a valid command`
            }
        }
    }
    
    res.json({
        'NodeCommand': req.body['NodeCommand'],
        'Numbers': req.body['Numbers'],
        'Answer': ans
    })
})

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))
