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
    labResult: str | None = None
    labParameters: dict | None = None

class BatchCreate(BaseModel):
    herbName: str = Field(min_length=1)
    herbNameHi: str = ""
    scientificName: str = ""
    quantity: float = Field(gt=0)
    unit: str = "kg"
    origin: Location = Field(default_factory=Location)
    imageUrl: str | None = None
    aiAnalysis: dict | None = None

def now() -> str:
    return datetime.now(timezone.utc).isoformat()

@router.get("")
async def list_batches():
    return await batch_store.list()

@router.get("/{batch_id}")
async def get_batch(batch_id: str):
    batch = await batch_store.get(batch_id)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return batch

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_batch(
    payload: BatchCreate, current_user: TokenData = Depends(get_current_user)
):
    # Only collectors or admins can create a batch (collection stage)
    if current_user.role not in ("collector", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only collectors can create batches")
        
    created_at = now()
    batch_id = f"HB-{uuid4().hex[:8]}"
    collector_name = current_user.name or current_user.username or "Unknown collector"
    actor_id = current_user.id or current_user.username or "unknown"

    manual_check = False
    if payload.aiAnalysis:
        try:
            conf = payload.aiAnalysis.get("plantIdentification", {}).get("confidence", 0)
            if float(conf) < 0.80:
                manual_check = True
        except:
            pass

    # ── Record on blockchain (Stage 1: Collection) ──────────────────
    from app.blockchain import blockchain
    location_str = payload.origin.address or f"{payload.origin.latitude},{payload.origin.longitude}"
    collection_tx_hash = blockchain.record_collection(
        batch_id=batch_id,
        herb_name=payload.herbName,
        quantity=int(payload.quantity),
        actor_id=actor_id,
        quality="initial",
        location=location_str,
        details=f"Batch collected by {collector_name}",
    )

    batch = {
        "id": batch_id,
        **payload.model_dump(exclude_none=True),
        "currentStage": "collection",
        "createdAt": created_at,
        "updatedAt": created_at,
        "collectorId": actor_id,
        "collectorName": collector_name,
        "manualCheckRequired": manual_check,
        "testingStatus": "pending",
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
                "blockchainTxHash": collection_tx_hash,
            }
        ],
        "qrCodeUrl": f"/verify/{batch_id}",
        "blockchainTxHash": collection_tx_hash,
        "mainReport": None,
        "reports": [],
    }
    return await batch_store.create(batch)

STAGE_ROLE_MAP = {
    "collection": "collector",
    "processing": "processor",
    "testing": "tester",
    "shipment": "shipper",
    "retail": "retailer",
}

@router.post("/{batch_id}/events")
async def add_event(
    batch_id: str, payload: EventCreate, current_user: TokenData = Depends(get_current_user)
):
    required_role = STAGE_ROLE_MAP.get(payload.stage)
    if current_user.role != "admin" and current_user.role != required_role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Role '{current_user.role}' cannot add event for stage '{payload.stage}'. Required: '{required_role}'"
        )
        
    existing_batch = await batch_store.get(batch_id)
    if not existing_batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    
    if existing_batch.get("testingStatus") == "failed":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Cannot add events to a batch that failed lab testing."
        )

    # ── Auto-calculate labResult for testing stage ──────────────────
    calculated_lab_result = payload.labResult or "N/A"
    if payload.stage == "testing":
        try:
            params = payload.labParameters or {}
            purity = float(params.get("purity", 0))
            moisture = float(params.get("moistureContent", 100))
            if purity >= 80 and moisture <= 12:
                calculated_lab_result = "passed"
            else:
                calculated_lab_result = "failed"
        except:
            calculated_lab_result = "failed"

    from app.blockchain import blockchain

    # ── Record this step on the blockchain ──────────────────────────
    location_str = ""
    if payload.location:
        location_str = payload.location.address or f"{payload.location.latitude},{payload.location.longitude}"

    step_tx_hash = blockchain.record_step(
        batch_id=batch_id,
        stage=payload.stage,
        actor_id=payload.actorId,
        quality=calculated_lab_result,
        location=location_str,
        action=f"{payload.stage} stage recorded",
        details=payload.notes or "",
    )

    event_data = payload.model_dump(exclude_none=True)
    event_data["labResult"] = calculated_lab_result
    event = {
        "id": f"EVT-{uuid4().hex[:10]}",
        "batchId": batch_id,
        **event_data,
        "timestamp": now(),
        "blockchainTxHash": step_tx_hash,
    }
    batch = await batch_store.add_event(batch_id, event)
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

    from app.services.report_service import generate_main_report, generate_secondary_report
    
    # Testing stage — store report hash and update testingStatus
    if payload.stage == "testing":
        batch = await batch_store.update(batch_id, {"testingStatus": calculated_lab_result})
        report = generate_main_report(batch)
        report_tx_hash = blockchain.store_report_hash(batch_id, report["hash"])
        report["blockchainTxHash"] = report_tx_hash
        batch = await batch_store.update(batch_id, {"mainReport": report})
        
    elif payload.stage in ("shipment", "retail"):
        report = generate_secondary_report(batch, event)
        reports = batch.get("reports", [])
        reports.append(report)
        batch = await batch_store.update(batch_id, {"reports": reports})
        
    return batch


class LabelRequest(BaseModel):
    count: int = Field(gt=0, le=1000)

@router.post("/{batch_id}/labels")
async def generate_labels(
    batch_id: str, payload: LabelRequest, current_user: TokenData = Depends(get_current_user)
):
    if current_user.role not in ("retailer", "admin", "shipper", "processor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You don't have permission to generate retail labels."
        )
    units = await batch_store.generate_retail_units(batch_id, payload.count)
    if not units:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")
    return {"units": units}
