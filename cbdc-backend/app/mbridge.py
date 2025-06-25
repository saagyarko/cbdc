# cbdc-backend/backend/mbridge.py
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class CrossBorderRequest(BaseModel):
    tx_id: str
    from_currency: str
    to_currency: str
    amount: float
    sender: str
    receiver: str

@router.post("/mbridge")
def mbridge_settlement(req: CrossBorderRequest):
    # Simulate cedi-naira settlement
    if req.from_currency == "GHS" and req.to_currency == "NGN":
        # Mock conversion rate
        naira_amount = req.amount * 70
        return {
            "tx_id": req.tx_id,
            "from_currency": req.from_currency,
            "to_currency": req.to_currency,
            "original_amount": req.amount,
            "settled_amount": naira_amount,
            "status": "settled"
        }
    return {"status": "unsupported currency pair"}