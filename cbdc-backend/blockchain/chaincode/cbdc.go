// cbdc-backend/blockchain/chaincode/cbdc.go
package main

import (
    "encoding/json"
    "fmt"
    "strconv"
    "time"

    "github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Account structure
type Account struct {
    Name    string  `json:"name"`
    Balance float64 `json:"balance"`
}

// Transaction structure for history
type Transaction struct {
    TxID      string  `json:"tx_id"`
    Sender    string  `json:"sender"`
    Receiver  string  `json:"receiver"`
    Amount    float64 `json:"amount"`
    Timestamp string  `json:"timestamp"`
}

// SmartContract provides functions for managing CBDC
type SmartContract struct {
    contractapi.Contract
}

// InitLedger initializes the ledger with two accounts
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
    accounts := []Account{
        {Name: "BankA", Balance: 1000000},
        {Name: "BankB", Balance: 500000},
    }
    for _, acc := range accounts {
        accJSON, err := json.Marshal(acc)
        if err != nil {
            return err
        }
        err = ctx.GetStub().PutState(acc.Name, accJSON)
        if err != nil {
            return err
        }
    }
    return nil
}

// Transfer transfers amount from sender to receiver
func (s *SmartContract) Transfer(ctx contractapi.TransactionContextInterface, sender string, receiver string, amountStr string) error {
    amount, err := strconv.ParseFloat(amountStr, 64)
    if err != nil || amount <= 0 {
        return fmt.Errorf("invalid amount")
    }

    senderAcc, err := s.QueryAccount(ctx, sender)
    if err != nil {
        return fmt.Errorf("sender account error: %v", err)
    }
    receiverAcc, err := s.QueryAccount(ctx, receiver)
    if err != nil {
        return fmt.Errorf("receiver account error: %v", err)
    }
    if senderAcc.Balance < amount {
        return fmt.Errorf("insufficient balance")
    }

    senderAcc.Balance -= amount
    receiverAcc.Balance += amount

    // Update states
    senderJSON, _ := json.Marshal(senderAcc)
    receiverJSON, _ := json.Marshal(receiverAcc)
    ctx.GetStub().PutState(sender, senderJSON)
    ctx.GetStub().PutState(receiver, receiverJSON)

    // Record transaction for history
    tx := Transaction{
        TxID:      ctx.GetStub().GetTxID(),
        Sender:    sender,
        Receiver:  receiver,
        Amount:    amount,
        Timestamp: time.Now().Format(time.RFC3339),
    }
    txKey := fmt.Sprintf("tx_%s_%s", sender, ctx.GetStub().GetTxID())
    txJSON, _ := json.Marshal(tx)
    ctx.GetStub().PutState(txKey, txJSON)

    return nil
}

// QueryBalance returns the balance of an account
func (s *SmartContract) QueryBalance(ctx contractapi.TransactionContextInterface, account string) (float64, error) {
    acc, err := s.QueryAccount(ctx, account)
    if err != nil {
        return 0, err
    }
    return acc.Balance, nil
}

// QueryAccount returns the Account struct
func (s *SmartContract) QueryAccount(ctx contractapi.TransactionContextInterface, account string) (*Account, error) {
    accJSON, err := ctx.GetStub().GetState(account)
    if err != nil || accJSON == nil {
        return nil, fmt.Errorf("account not found")
    }
    var acc Account
    err = json.Unmarshal(accJSON, &acc)
    if err != nil {
        return nil, err
    }
    return &acc, nil
}

// QueryHistory returns all transactions for an account
func (s *SmartContract) QueryHistory(ctx contractapi.TransactionContextInterface, account string) ([]Transaction, error) {
    resultsIterator, err := ctx.GetStub().GetStateByRange("tx_", "tx_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")
    if err != nil {
        return nil, err
    }
    defer resultsIterator.Close()

    var txs []Transaction
    for resultsIterator.HasNext() {
        queryResponse, err := resultsIterator.Next()
        if err != nil {
            return nil, err
        }
        var tx Transaction
        json.Unmarshal(queryResponse.Value, &tx)
        if tx.Sender == account || tx.Receiver == account {
            txs = append(txs, tx)
        }
    }
    return txs, nil
}

func main() {
    chaincode, err := contractapi.NewChaincode(new(SmartContract))
    if err != nil {
        panic(fmt.Sprintf("Error creating cbdc chaincode: %v", err))
    }
    if err := chaincode.Start(); err != nil {
        panic(fmt.Sprintf("Error starting cbdc chaincode: %v", err))
    }
}