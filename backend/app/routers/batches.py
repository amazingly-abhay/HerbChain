from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.middleware.auth import TokenData, get_current_user
from app.services.batch_store import batch_store

router = APIRouter(prefix="/api/batches", tags=["batches"])

Stage = Literal["collection", "processing", "testing", "shipment", "retail"]


class Location(BaseModel):
    latitude: float = 0
    longitude: float = 0
    address: str = ""


class EventCreate(BaseModel):
    stage: Stage
    actorId: str
    actorName: str
    actorRole: str
    location: Location
    notes: str = ""


class BatchCreate(BaseModel):
    herbName: str = Field(min_length=1)
    herbNameHi: str = ""
    scientificName: str = ""
    quantity: float = Field(gt=0)
    unit: str = "kg"
    origin: Location = Field(default_factory=Location)


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.get("")
async def list_batches():
    return batch_store.list()


@router.get("/{batch_id}")
async def get_batch(batch_id: str):
    batch = batch_store.get(batch_id)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return batch


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_batch(
    payload: BatchCreate, current_user: TokenData = Depends(get_current_user)
):
    created_at = now()
    batch_id = f"HB-{uuid4().hex[:8]}"
    collector_name = current_user.name or current_user.username or "Unknown collector"
    actor_id = current_user.id or current_user.username or "unknown"
    batch = {
        "id": batch_id,
        **payload.model_dump(),
        "currentStage": "collection",
        "createdAt": created_at,
        "updatedAt": created_at,
        "collectorId": actor_id,
        "collectorName": collector_name,
        "events": [
            {
                "id": f"EVT-{uuid4().hex[:10]}",
                "batchId": batch_id,
                "stage": "collection",
                "actorId": actor_id,
                "actorName": collector_name,
                "actorRole": current_user.role or "collector",
                "timestamp": created_at,
                "location": payload.origin.model_dump(),
                "notes": "Batch collected and registered",
                "blockchainTxHash": "pending",
            }
        ],
        "qrCodeUrl": f"/verify/{batch_id}",
        "blockchainTxHash": "pending",
    }
    return batch_store.create(batch)


@router.post("/{batch_id}/events")
async def add_event(
    batch_id: str, payload: EventCreate, current_user: TokenData = Depends(get_current_user)
):
    event = {
        "id": f"EVT-{uuid4().hex[:10]}",
        "batchId": batch_id,
        **payload.model_dump(),
        "timestamp": now(),
        "blockchainTxHash": "pending",
    }
    batch = batch_store.add_event(batch_id, event)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return batch
