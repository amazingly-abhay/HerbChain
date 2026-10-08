from fastapi import APIRouter
from app.blockchain import blockchain

router = APIRouter(prefix="/api/blockchain", tags=["blockchain"])


@router.get("/status")
async def get_blockchain_status():
    """Returns status of the blockchain connection, wallet, network, and explorer."""
    return blockchain.get_status()
