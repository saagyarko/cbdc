from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List
import subprocess
from app import schemas
from app.crud import crud_transaction
from app.db.session import get_db
from app.db.mongo_client import get_mongo_db
from app.services import fraud_detection

router = APIRouter()


@router.get("/", response_model=List[schemas.Transaction])
def read_transactions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all transactions with pagination.
    """
    transactions = crud_transaction.get_multi(db, skip=skip, limit=limit)
    return transactions


@router.get("/{tx_id}", response_model=schemas.Transaction)
def read_transaction(
    *,
    db: Session = Depends(get_db),
    tx_id: str,
) -> Any:
    """
    Get a specific transaction by its tx_id.
    """
    transaction = crud_transaction.get_by_tx_id(db=db, tx_id=tx_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction


@router.post("/", response_model=schemas.Transaction)
def create_transaction(
    *,
    db: Session = Depends(get_db),
    transaction_in: schemas.TransactionCreate,
    mongo_db = Depends(get_mongo_db),
) -> Any:
    """
    Create a new transaction with fraud detection, Fabric settlement, and logging.
    """
    # 1. Call fraud detection (simulate Lambda)
    fraud_result = fraud_detection.get_fraud_score("pending-tx")
    fraud_score = fraud_result.get("fraud_score", 0)

    # 2. If fraud_score > 0.8, log to MongoDB and return flagged
    if fraud_score > 0.8:
        mongo_db.fraud_logs.insert_one({
            "sender": transaction_in.sender,
            "receiver": transaction_in.receiver,
            "amount": transaction_in.amount,
            "fraud_score": fraud_score,
            "status": "flagged"
        })
        raise HTTPException(status_code=400, detail={"status": "flagged", "fraud_score": fraud_score})

    # 3. Call Fabric SDK via subprocess
    try:
        result = subprocess.check_output([
            "node", "app/fabric-sdk.js", "Transfer", transaction_in.sender, transaction_in.receiver, str(transaction_in.amount)
        ])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fabric SDK error: {str(e)}")

    # 4. Log to RDS (ORM)
    transaction = crud_transaction.create(db=db, obj_in=transaction_in)

    return transaction


@router.get("/balance/{account}")
def get_balance(account: str) -> Any:
    """
    Query the balance of an account from the blockchain.
    """
    try:
        result = subprocess.check_output([
            "node", "app/fabric-sdk.js", "QueryBalance", account
        ])
        return {"account": account, "balance": float(result.decode().strip())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fabric SDK error: {str(e)}")


@router.get("/history/{account}")
def get_history(account: str) -> Any:
    """
    Query the transaction history of an account from the blockchain.
    """
    import subprocess
    import json
    try:
        result = subprocess.check_output([
            "node", "app/fabric-sdk.js", "QueryHistory", account
        ])
        # The chaincode should return a JSON array of transactions
        return {"account": account, "history": json.loads(result.decode().strip())}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fabric SDK error: {str(e)}")


@router.post("/init-ledger")
def init_ledger() -> Any:
    """
    Initialize the ledger with default accounts via the blockchain.
    """
    import subprocess
    try:
        result = subprocess.check_output([
            "node", "app/fabric-sdk.js", "InitLedger"
        ])
        return {"status": "success", "result": result.decode().strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fabric SDK error: {str(e)}")


@router.get("/account/{account}")
def get_account(account: str) -> Any:
    """
    Get full account details from the blockchain.
    """
    import subprocess
    import json
    try:
        result = subprocess.check_output([
            "node", "app/fabric-sdk.js", "QueryAccount", account
        ])
        return json.loads(result.decode().strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fabric SDK error: {str(e)}") 