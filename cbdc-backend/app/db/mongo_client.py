from pymongo import MongoClient
from app.core.config import settings

class MongoDB:
    def __init__(self):
        self.client = MongoClient(settings.MONGO_URI)
        self.db = self.client[settings.MONGO_DB_NAME]

    def get_db(self):
        return self.db

    def close(self):
        self.client.close()

mongodb = MongoDB()

def get_mongo_db():
    """
    FastAPI dependency that provides a PyMongo database instance.
    """
    return mongodb.get_db()

# You can also register startup and shutdown events in your main.py to handle the connection lifecycle
# @app.on_event("startup")
# async def startup_db_client():
#     # This is where you might connect to the db if you didn't do it at module level
#     pass

# @app.on_event("shutdown")
# async def shutdown_db_client():
#     mongodb.close() 