//npm init --yes
//npm install express ip axios fs child_process

const axios = require('axios');

const express = require('express')
const ip = require("ip")
const fs = require('fs')
var colors = require('colors');

const { execSync } = require('child_process')

const app = express()
const ipAddress = ip.address()
const ipPort = 5000

let dataCollectedResults = []
let dataLookupTable = []

function getMinDelay(dataLookupTable){
    return Math.round(dataLookupTable.reduce((min, exec) => exec.TotalDelay < min.TotalDelay ? exec : min).TotalDelay)
}

async function autoRescale(RequestInterval, TargetDelay, currentReplicasCount) {
    execSync(`kubectl scale --replicas=${currentReplicasCount} -f k8-tp-03-busy-box-deployment.yaml`)
    let lastReplicasCount = currentReplicasCount
    let podWaitingIterations = 0
    
    while (true) {
        
        if(lastReplicasCount != currentReplicasCount){
            execSync(`kubectl scale --replicas=${currentReplicasCount} -f k8-tp-03-busy-box-deployment.yaml`);
            lastReplicasCount = currentReplicasCount
            console.log(`⚠️ Nombre de pods opérationels : ${currentReplicasCount} ⚠️`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre que les pods chauffent
        }
    
        const data = JSON.parse(fs.readFileSync('collected_data_temp.json'));
        const avgDelay = data.map(dp => dp.Delay).reduce((a,b)=>a+b,0)/data.length;
        if (data.length < currentReplicasCount) {
            if(podWaitingCount > 4){
                console.log(`⚠️ ${currentReplicasCount - data.length} ne se lance(nt) pas. → Supression d'un pod `);
                currentReplicasCount = Math.max(1, currentReplicasCount - 1);
                podWaitingCount = 0
            }else{
                console.log(`⏳ Attente que tous les pods répondent (${data.length}/${currentReplicasCount})...`);
                podWaitingCount +=1
            }
            continue;
        }

        await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre que les pods chauffent
        
        console.log(colors.cyan(`Latence moyenne: ${Math.round(avgDelay)} ms`));

        if (avgDelay > TargetDelay*1.2) {
            currentReplicasCount += 1;
            console.log(`⚠️ Délai trop haut → ajout d'un pod (${currentReplicasCount})`);
        } else if (avgDelay < TargetDelay * 0.8) {
            currentReplicasCount = Math.max(1, currentReplicasCount - 1);
            console.log(`✅ Délai trop bas → suppression d'un pod (${currentReplicasCount})`);
        } else {
            console.log('✅ Délai dans la marge → fin du scaling');
            break;
        }
    }
}

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
    <h1>Simple AutoScaler</h1>
    <p>&nbsp;</p>
    <h2>Use JSON commands to auto-scale the deployment</h2>
    `)
})

///////////////////////////////////////////////////////////////////////////////
app.post('/json', async (req, res) => {
    let ans = ""
    let jsonAnalysisFiles

    let x1, x2, x3, x4
    let rn, ri

    switch (req.body['MessageType']) {
        case 'Command':
            ans = `Execute:${req.body['NodeCommand']}`
            switch (req.body['NodeCommand']) {
                case 'BuildLookupTable':
                    dataCollectedResults = []
                    dataLookupTable = []
                    profiles_dir = "collected-profiles"
                    jsonAnalysisFiles = fs.readdirSync(`./${profiles_dir}`).filter(fn => fn.endsWith('-summary.json'))

                    jsonAnalysisFiles.forEach(fn => {                        
                        x1 = fn.split('-')
                        rn = Number(x1[1])
                        ri = Number(x1[2])

                        x1 = JSON.parse(fs.readFileSync(`./${profiles_dir}/${fn}`))

                        x2 = 0
                        x3 = 0
                        x1.forEach(dp => {
                            x2 += dp['CalculationTime']
                            x3 += dp['TotalDelay']
                        })
                        x2 /= x1.length
                        x3 /= x1.length

                        dataCollectedResults.push({
                            'Replicas': rn,
                            'RequestInterval': ri,
                            'CalculationTime': x2,
                            'TotalDelay': x3
                        })
                    })

                    fs.writeFileSync('collected-data.json', JSON.stringify(dataCollectedResults, null, 4))
                    let index = 1
                    dataCollectedResults.forEach(dp => {
                        x2 = dataCollectedResults.filter(xx => (xx['RequestInterval'] <= dp['RequestInterval']))
                        x2 = x2.filter(xx => xx['TotalDelay'] <= dp['TotalDelay'])
                        x3 = x2.map(xx => xx['Replicas'])
                        x3 = Math.min(...x3)


                        dataLookupTable.push({
                            'RequestInterval': dp['RequestInterval'],
                            'TotalDelay': dp['TotalDelay'],
                            'Replicas': dp['Replicas'],
                            'LookupTable': x3
                        })
                    })

                    fs.writeFileSync('lookup-table-data.json', JSON.stringify(dataLookupTable, null, 4))

                    break

                case 'AutoScale':
                    let targetDelay = Math.round(req.body['TotalDelay'])
                    const requestInterval = Math.round(req.body['RequestInterval'])

                    if(requestInterval in [10,20,30,40,50]){
                        let matchingExecutions = dataLookupTable.filter(exec => exec.RequestInterval == requestInterval)
                        const minDelayPossible = getMinDelay(matchingExecutions)
                        
                        if(targetDelay < minDelayPossible){
                            console.log(`⚠️ Délais cible trop ambitieux : ${targetDelay} --> Le délais est réajusté pour être plus raisonnable : ${minDelayPossible}`)
                            targetDelay = minDelayPossible
                        }
    
                        let bestExec = matchingExecutions.reduce((min, exec) =>
                            exec.TotalDelay < min.TotalDelay ? exec : min
                        )
                        
                        let validExecutions = matchingExecutions.filter(exec => exec.TotalDelay <= targetDelay)
                        
                        if (validExecutions.length > 0) {
                            bestExec = validExecutions.reduce((min, exec) =>
                                exec.Replicas < min.Replicas ? exec : min
                            )
                            console.log(bestExec)
                        } else {
                            console.log("On n'a pas trouvé mieux :")
                            console.log(bestExec)
                        }
                        
                        x3 = bestExec.Replicas
                        
                    }else{
                        x3 = 1
                    }
                    
                    ans = `Number of Replicas to reach TotalDelay of ${targetDelay} for RequestInterval of ${requestInterval} should be => ${x3}`

                    //Write this section to set the right number of replicas
                    await autoRescale(requestInterval, targetDelay,x3);
                    break
            }
            break

        default:
            ans += ` => Unknown Message Type => ${req.body['MessageType']} !!!`
    }

    res.json({ 'Message': ans })
})

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))
