from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # App
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "herbchain"

    # Blockchain
    RPC_URL: str = "http://127.0.0.1:8545" # default local RPC
    CONTRACT_ADDRESS: str = ""
    PRIVATE_KEY: str = ""

    # External APIs
    GEMINI_API_KEY: str = ""
    PINATA_API_KEY: str = ""
    PINATA_SECRET_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
