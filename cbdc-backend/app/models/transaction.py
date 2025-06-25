from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
import uuid

from app.db.base import Base

def generate_uuid():
    return str(uuid.uuid4())

class Transaction(Base):
    id = Column(Integer, primary_key=True, index=True)
    tx_id = Column(String, unique=True, index=True, default=generate_uuid)
    sender = Column(String, index=True, nullable=False)
    receiver = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now()) 