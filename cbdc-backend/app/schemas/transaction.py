from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Shared properties
class TransactionBase(BaseModel):
    sender: str
    receiver: str
    amount: float

# Properties to receive on transaction creation
class TransactionCreate(TransactionBase):
    pass

# Properties to return to client
class Transaction(TransactionBase):
    id: int
    tx_id: str
    timestamp: datetime

    class Config:
        orm_mode = True 