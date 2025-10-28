const fs = require('fs')

let jsonDataPoints
let arrDataPoints = []
let arrSummarizedDataPoints = []

let x1, x2, x3
let NodeIPs = []

var myArgs = process.argv.slice(2)
if (myArgs[0] == null) {
    console.log('Please provide results-x-y.json')
    return
} else {
    inputJsonFile = myArgs[0]
    outputJsonFile = inputJsonFile.replace('-raw.json', '-summary.json')
}

jsonDataPoints = fs.readFileSync(inputJsonFile)
jsonDataPoints = JSON.parse(jsonDataPoints)

jsonDataPoints.forEach(dp => {
    arrDataPoints.push(
        {
            'TimeStamp': dp['TimeStamp'],
            'NodeIP': dp['Response']['NodeIP'],
            'CalculationTime': dp['Response']['CalculationTime'],
            'TotalDelay': dp['TotalDelay']
        }
    )
})

x1 = arrDataPoints.map(dp => dp['NodeIP'])
NodeIPs = [...new Set(x1)]
NodeIPs.sort()

NodeIPs.forEach(nIP => {
    x1 = arrDataPoints.filter(dp => (dp['NodeIP'] == nIP))

    x2 = 0
    x3 = 0
    x1.forEach(dp => {
        x2 += dp['CalculationTime']
        x3 += dp['TotalDelay']
    })
    x2 /= x1.length
    x3 /= x1.length

    arrSummarizedDataPoints.push(
        {
            'NodeIP': nIP,
            'NumberOfPoints': x1.length,
            'CalculationTime': x2,
            'TotalDelay': x3
        }
    )
})

fs.writeFileSync(outputJsonFile, JSON.stringify(arrSummarizedDataPoints, null, 4))




