import logging
from app.db.session import engine
from app.db.base import Base
from app.models.transaction import Transaction  # Make sure all models are imported here

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    logger.info("Creating all tables in database...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created successfully.")

if __name__ == "__main__":
    init_db() 