// cbdc-backend/backend/fabric-sdk.js
// Node.js SDK to interact with Fabric from FastAPI

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

const ccpPath = path.resolve(__dirname, '../blockchain/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

async function submitTransaction(functionName, args) {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('fintrust-channel');
    const contract = network.getContract('cbdc');
    const result = await contract.submitTransaction(functionName, ...args);
    await gateway.disconnect();
    return result.toString();
}

async function evaluateTransaction(functionName, args) {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('fintrust-channel');
    const contract = network.getContract('cbdc');
    const result = await contract.evaluateTransaction(functionName, ...args);
    await gateway.disconnect();
    return result.toString();
}

// CLI handler for subprocess calls from FastAPI
if (require.main === module) {
    const [,, functionName, ...args] = process.argv;
    (async () => {
        try {
            let result;
            if (functionName === 'Transfer') {
                result = await submitTransaction(functionName, args);
                console.log(result);
            } else if (functionName === 'QueryBalance') {
                result = await evaluateTransaction(functionName, args);
                console.log(result);
            } else if (functionName === 'QueryHistory') {
                result = await evaluateTransaction(functionName, args);
                try {
                    const parsed = JSON.parse(result);
                    console.log(JSON.stringify(parsed));
                } catch (e) {
                    console.log('[]');
                }
            } else if (functionName === 'InitLedger') {
                // No args
                result = await submitTransaction(functionName, []);
                console.log(result);
            } else if (functionName === 'QueryAccount') {
                // args: [account]
                result = await evaluateTransaction(functionName, args);
                try {
                    const parsed = JSON.parse(result);
                    console.log(JSON.stringify(parsed));
                } catch (e) {
                    // If not valid JSON, print as string
                    console.log(JSON.stringify({ raw: result }));
                }
            } else {
                // Print usage/help message
                console.error(JSON.stringify({
                    error: 'Unsupported function: ' + functionName,
                    usage: 'node fabric-sdk.js [Transfer|QueryBalance|QueryHistory|InitLedger|QueryAccount] ...args',
                    examples: [
                        'node fabric-sdk.js Transfer BankA BankB 1000',
                        'node fabric-sdk.js QueryBalance BankA',
                        'node fabric-sdk.js QueryHistory BankA',
                        'node fabric-sdk.js InitLedger',
                        'node fabric-sdk.js QueryAccount BankA'
                    ]
                }));
                process.exit(2);
            }
        } catch (err) {
            // Print error as JSON to stderr
            console.error(JSON.stringify({ error: err.message }));
            process.exit(1);
        }
    })();
}

module.exports = { submitTransaction, evaluateTransaction };