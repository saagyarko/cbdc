from fastapi import APIRouter

from app.api.v1.endpoints import transactions, fraud_alerts, compliance

api_router = APIRouter()
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(fraud_alerts.router, prefix="/fraud-alerts", tags=["fraud-alerts"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"]) 