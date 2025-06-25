from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Any, List
import os

from app.crud import crud_transaction
from app.services import compliance
from app.db.session import get_db

router = APIRouter()

@router.get("/report/{tx_id}", response_class=FileResponse)
def generate_compliance_report(
    *,
    db: Session = Depends(get_db),
    tx_id: str,
) -> Any:
    """
    Generate a PDF compliance report for a specific transaction.
    """
    transaction = crud_transaction.get_by_tx_id(db=db, tx_id=tx_id)
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    report_path = compliance.generate_aml_report(transaction=transaction)
    
    return FileResponse(
        path=report_path, 
        media_type='application/pdf', 
        filename=f"report_{tx_id}.pdf"
    )

@router.get("/reports", response_model=List[str])
def list_compliance_reports() -> Any:
    """
    List all available compliance reports (PDFs).
    """
    reports_dir = "temp_reports"
    if not os.path.exists(reports_dir):
        return []
    return [f for f in os.listdir(reports_dir) if f.endswith('.pdf')]

@router.get("/aml-status/{account}")
def check_aml_status(account: str) -> Any:
    """
    Mock endpoint to check AML/KYC status for an account.
    """
    # In a real system, this would query a compliance database or service
    return {"account": account, "aml_status": "clear", "kyc_status": "verified"} 