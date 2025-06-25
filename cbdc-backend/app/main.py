# cbdc-backend/app/main.py
from fastapi import FastAPI
from app.api.api import api_router
from app.mbridge import router as mbridge_router

app = FastAPI(title="FinTrust CBDC Backend", version="1.0.0")

# Root health check endpoint
def health_check():
    return {"status": "ok", "message": "FinTrust CBDC Backend is running"}

app.add_api_route("/", health_check, methods=["GET"], tags=["health"])

# Include main API routers (transactions, fraud_alerts, compliance)
app.include_router(api_router, prefix="/api/v1")

# Include mBridge router for cross-border settlement simulation
app.include_router(mbridge_router, prefix="/api/v1")

# All business logic and endpoints are now in routers for modularity.
# See app/api/v1/endpoints/ and app/mbridge.py for endpoint implementations.