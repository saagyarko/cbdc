#!/bin/bash
# cbdc-backend/blockchain/tests/test_txs.sh
# Simulate 1,000 transactions/day

for i in $(seq 1 1000); do
  peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
    -C fintrust-channel -n cbdc -c "{\"function\":\"Transfer\",\"Args\":[\"BankA\",\"BankB\",\"1\"]}" \
    --tls --cafile "$PWD/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"
  sleep 1
done