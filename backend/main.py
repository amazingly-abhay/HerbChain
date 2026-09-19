from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(
    title="HerbChain API",
    description="FastAPI backend for HerbChain Ayurvedic traceability platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routers import auth, batches, ai, ipfs, verify

app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(ai.router)
app.include_router(ipfs.router)
app.include_router(verify.router)
