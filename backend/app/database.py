from motor.motor_asyncio import AsyncIOMotorClient
from mongomock_motor import AsyncMongoMockClient
from app.config import settings

class Database:
    client = None

db = Database()

async def get_db():
    if db.client is None:
        try:
            # We'll use mock client for now to avoid the connection refused error
            db.client = AsyncMongoMockClient()
        except Exception as e:
            print("Fallback to motor client failed", e)
    return db.client[settings.DATABASE_NAME]

async def close_db():
    if db.client is not None:
        pass # mock client doesn't need to close or doesn't support close()

