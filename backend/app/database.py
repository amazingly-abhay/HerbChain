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
            can_resolve = True
            if "mongodb+srv://" in settings.MONGODB_URL:
                try:
                    srv_host = settings.MONGODB_URL.split("mongodb+srv://")[1].split("/")[0].split("@")[-1].split("?")[0]
                    # mongodb+srv requires SRV record lookup, not A-record lookup
                    import dns.resolver
                    resolver = dns.resolver.Resolver()
                    resolver.timeout = 2.0
                    resolver.lifetime = 2.0
                    if hasattr(resolver, "resolve"):
                        resolver.resolve(f"_mongodb._tcp.{srv_host}", "SRV")
                    else:
                        resolver.query(f"_mongodb._tcp.{srv_host}", "SRV")
                except Exception as e:
                    print(f"SRV resolution check failed ({e}) — falling back to mock client.")
                    can_resolve = False

            if can_resolve:
                try:
                    # Connect to real live MongoDB cluster
                    db.client = AsyncIOMotorClient(
                        settings.MONGODB_URL, 
                        serverSelectionTimeoutMS=5000,
                        connectTimeoutMS=5000,
                        tlsCAFile=certifi.where()
                    )
                    # Verify connection
                    await db.client.server_info()
                    print("✅ Successfully connected to live MongoDB cluster!")
                except Exception as e:
                    print(f"Failed to connect to live MongoDB ({e}) — falling back to mock client.")
                    db.client = AsyncMongoMockClient()
            else:
                print("Remote MongoDB host cannot be resolved — immediately falling back to mock client.")
                db.client = AsyncMongoMockClient()
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

