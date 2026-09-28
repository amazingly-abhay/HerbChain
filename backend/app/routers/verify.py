from fastapi import APIRouter, HTTPException, status

from app.services.batch_store import batch_store

router = APIRouter(prefix="/api/verify", tags=["verify"])


@router.get("/{identifier}")
async def verify_batch(identifier: str):
    # Determine if it's a batch ID or a unit ID
    if "-" in identifier and len(identifier.split("-")) == 3:
        # It's a retail unit (e.g. HB-1234-001)
        batch, unit = batch_store.get_retail_unit(identifier)
        if not batch or not unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch or Unit not found")
        return {"verified": True, "batch": batch, "unit": unit}
    else:
        # Standard batch ID
        batch = batch_store.get(batch_id=identifier)
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
        return {"verified": True, "batch": batch, "unit": None}
