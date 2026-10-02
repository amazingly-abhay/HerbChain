import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi

async def main():
    print("Testing connection to:", settings.MONGODB_URL)
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        info = await client.server_info()
        print("Success!", info)
    except Exception as e:
        print("Failed!", type(e), e)

if __name__ == "__main__":
    asyncio.run(main())
