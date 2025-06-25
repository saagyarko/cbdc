from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate


def get_by_tx_id(db: Session, *, tx_id: str) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.tx_id == tx_id).first()


def get_multi(db: Session, *, skip: int = 0, limit: int = 100) -> List[Transaction]:
    return db.query(Transaction).offset(skip).limit(limit).all()


def create(db: Session, *, obj_in: TransactionCreate) -> Transaction:
    db_obj = Transaction(
        sender=obj_in.sender,
        receiver=obj_in.receiver,
        amount=obj_in.amount,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj 