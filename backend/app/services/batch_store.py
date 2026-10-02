"""Small in-process store used until a production database is configured.

Keeping the API's canonical batch shape here means the frontend never has to
merge API responses with mock data. Data survives for the FastAPI process and
can later be replaced by a repository backed by MongoDB.
"""

from typing import Any
from datetime import datetime, timezone
from app.database import get_db

class BatchStore:
    async def list(self) -> list[dict[str, Any]]:
        db = await get_db()
        cursor = db.batches.find({}, {"_id": 0})
        return await cursor.to_list(length=1000)

    async def get(self, batch_id: str) -> dict[str, Any] | None:
        db = await get_db()
        return await db.batches.find_one({"id": batch_id}, {"_id": 0})

    async def create(self, batch: dict[str, Any]) -> dict[str, Any]:
        db = await get_db()
        await db.batches.insert_one(batch.copy())
        return await self.get(batch["id"])

    async def add_event(self, batch_id: str, event: dict[str, Any]) -> dict[str, Any] | None:
        db = await get_db()
        result = await db.batches.update_one(
            {"id": batch_id},
            {
                "$push": {"events": event},
                "$set": {
                    "currentStage": event["stage"],
                    "updatedAt": event["timestamp"]
                }
            }
        )
        if result.modified_count == 0:
            return None
        return await self.get(batch_id)

    async def update(self, batch_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
        db = await get_db()
        result = await db.batches.update_one(
            {"id": batch_id},
            {"$set": data}
        )
        if result.matched_count == 0:
            return None
        return await self.get(batch_id)

    async def generate_retail_units(self, batch_id: str, count: int) -> list[dict[str, Any]]:
        db = await get_db()
        batch = await self.get(batch_id)
        if not batch:
            return []
            
        start_index = len(batch.get("retailUnits", [])) + 1
        new_units = []
        for i in range(count):
            unit_id = f"{batch_id}-{start_index + i:03d}"
            unit = {
                "id": unit_id,
                "batchId": batch_id,
                "isScanned": False,
                "scannedAt": None
            }
            new_units.append(unit)
            
        await db.batches.update_one(
            {"id": batch_id},
            {"$push": {"retailUnits": {"$each": new_units}}}
        )
        return new_units
        
    async def get_retail_unit(self, unit_id: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
        if "-" not in unit_id:
            return None, None
            
        batch_id = unit_id.rsplit("-", 1)[0]
        batch = await self.get(batch_id)
        if not batch or "retailUnits" not in batch:
            return None, None
            
        for i, unit in enumerate(batch["retailUnits"]):
            if unit["id"] == unit_id:
                current_state = dict(unit)
                
                if not unit["isScanned"]:
                    scanned_time = datetime.now(timezone.utc).isoformat()
                    db = await get_db()
                    await db.batches.update_one(
                        {"id": batch_id, "retailUnits.id": unit_id},
                        {"$set": {
                            f"retailUnits.{i}.isScanned": True,
                            f"retailUnits.{i}.scannedAt": scanned_time
                        }}
                    )
                    # Refresh batch to return updated batch state
                    batch = await self.get(batch_id)
                    
                return batch, current_state
                
        return None, None

batch_store = BatchStore()
