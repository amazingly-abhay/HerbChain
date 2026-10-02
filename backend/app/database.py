from motor.motor_asyncio import AsyncIOMotorClient
from mongomock_motor import AsyncMongoMockClient
from app.config import settings
import certifi

class Database:
    client = None

db = Database()

async def get_db():
    if db.client is None:
        if settings.ENVIRONMENT == "production" or "mongodb+srv://" in settings.MONGODB_URL:
            try:
                # Connect to real live MongoDB cluster
                db.client = AsyncIOMotorClient(
                    settings.MONGODB_URL, 
                    serverSelectionTimeoutMS=5000,
                    tlsCAFile=certifi.where()
                )
                # Verify connection
                await db.client.server_info()
                print("Successfully connected to live MongoDB cluster!")
            except Exception as e:
                print(f"Failed to connect to live MongoDB: {e}")
                raise e
        else:
            try:
                # Use mock client for local development prototyping
                print("Using mock MongoDB client for local prototyping.")
                db.client = AsyncMongoMockClient()
            except Exception as e:
                print("Fallback to mock client failed", e)
                
    return db.client[settings.DATABASE_NAME]

async def close_db():
    if db.client is not None:
        if isinstance(db.client, AsyncIOMotorClient):
            db.client.close()

