# FinTrust CBDC Blockchain Guide

## Architecture
- **3 Orgs:** Bank of Ghana, Bank A, Bank B
- **1 Peer per Org**
- **1 Raft Orderer**
- **1 Channel:** fintrust-channel
- **Chaincode:** Go, with initLedger, transfer, queryBalance, queryHistory

## Setup (Local)
1. Install Docker, Node.js, Go
2. Run `blockchain/setup.sh`
3. Test with `peer chaincode invoke/query`

## AWS Deployment
- ECS (t3.micro), 3 peers, 1 orderer, 3 CAs, 3 CouchDB
- IAM, Cognito, KMS, CloudWatch, S3 backup

## Integration
- FastAPI backend, Node.js SDK, TensorFlow Lambda, MongoDB Atlas, RDS

## Testing
- `blockchain/tests/test_txs.sh` simulates 1,000 tx/day

## Troubleshooting
- Docker: restart if errors
- AWS: check IAM roles, ECS logs

## Ghana Connectivity
- Pre-pull Docker images
- Use mobile hotspot for AWS CLI