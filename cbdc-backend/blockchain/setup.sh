#!/bin/bash
# cbdc-backend/blockchain/setup.sh
# Setup Hyperledger Fabric 2.5 test network (macOS)

set -e

echo "=== 1. Install dependencies (Docker, Node.js, Go) ==="
brew install --cask docker
brew install node go

echo "=== 2. Clone fabric-samples ==="
git clone https://github.com/hyperledger/fabric-samples.git
cd fabric-samples
git checkout v2.5.0

echo "=== 3. Download binaries and docker images ==="
cd test-network
./network.sh down
./network.sh up createChannel -ca -c fintrust-channel

echo "=== 4. Deploy chaincode ==="
export PATH=$PATH:$(pwd)/../bin
cp ../../blockchain/chaincode/cbdc.go ./chaincode/cbdc/go/
./network.sh deployCC -ccn cbdc -ccp ./chaincode/cbdc/go -ccl go -c fintrust-channel

echo "=== 5. Test chaincode ==="
export CORE_PEER_ADDRESS=localhost:7051
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  -C fintrust-channel -n cbdc -c '{"function":"InitLedger","Args":[]}' --tls --cafile "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
  -C fintrust-channel -n cbdc -c '{"function":"Transfer","Args":["BankA","BankB","1000"]}' --tls --cafile "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

peer chaincode query -C fintrust-channel -n cbdc -c '{"function":"QueryBalance","Args":["BankA"]}'
peer chaincode query -C fintrust-channel -n cbdc -c '{"function":"QueryBalance","Args":["BankB"]}'

echo "=== 6. Troubleshooting ==="
echo "If Docker errors: restart Docker Desktop."
echo "If network down: run './network.sh down' and './network.sh up createChannel -ca -c fintrust-channel' again."