from fastapi import APIRouter, HTTPException, status

from app.services.batch_store import batch_store

router = APIRouter(prefix="/api/verify", tags=["verify"])


@router.get("/{batch_id}")
async def verify_batch(batch_id: str):
    batch = batch_store.get(batch_id)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return {"verified": True, "batch": batch}
