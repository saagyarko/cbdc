from fastapi import APIRouter, WebSocket, HTTPException
from typing import Any
from pydantic import BaseModel
from app.services import fraud_detection

router = APIRouter()

class FraudCheckRequest(BaseModel):
    tx_id: str
    sender: str
    receiver: str
    amount: float

@router.post("/check")
def check_fraud(request: FraudCheckRequest) -> Any:
    """
    Score a transaction for fraud risk.
    """
    # In a real system, pass all fields to the model/Lambda
    result = fraud_detection.get_fraud_score(request.tx_id)
    return result

@router.get("/{tx_id}")
async def get_fraud_alert(tx_id: str) -> Any:
    """
    Get fraud alert for a specific transaction by calling the fraud detection service.
    """
    alert_data = fraud_detection.get_fraud_score(tx_id)
    return alert_data

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time fraud alerts.
    """
    await websocket.accept()
    # In the future, this will be driven by a message queue or a pub/sub system
    await websocket.send_json({"message": "Connected to fraud alert WebSocket"})
    # Example of pushing a mock alert
    import asyncio
    import json
    while True:
        await asyncio.sleep(10)
        alert = fraud_detection.get_fraud_score("live-tx-123")
        await websocket.send_text(json.dumps(alert)) 