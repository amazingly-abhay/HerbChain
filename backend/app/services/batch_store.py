"""Small in-process store used until a production database is configured.

Keeping the API's canonical batch shape here means the frontend never has to
merge API responses with mock data. Data survives for the FastAPI process and
can later be replaced by a repository backed by MongoDB.
"""

from copy import deepcopy
from typing import Any


class BatchStore:
    def __init__(self) -> None:
        self._batches: dict[str, dict[str, Any]] = {}

    def list(self) -> list[dict[str, Any]]:
        return [deepcopy(batch) for batch in self._batches.values()]

    def get(self, batch_id: str) -> dict[str, Any] | None:
        batch = self._batches.get(batch_id)
        return deepcopy(batch) if batch else None

    def create(self, batch: dict[str, Any]) -> dict[str, Any]:
        self._batches[batch["id"]] = deepcopy(batch)
        return deepcopy(batch)

    def add_event(self, batch_id: str, event: dict[str, Any]) -> dict[str, Any] | None:
        batch = self._batches.get(batch_id)
        if not batch:
            return None
        batch["events"].append(deepcopy(event))
        batch["currentStage"] = event["stage"]
        batch["updatedAt"] = event["timestamp"]
        return deepcopy(batch)

    def update(self, batch_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
        """Update arbitrary fields on a batch (e.g. to store reports)."""
        batch = self._batches.get(batch_id)
        if not batch:
            return None
        for key, value in data.items():
            batch[key] = deepcopy(value)
        return deepcopy(batch)

    def generate_retail_units(self, batch_id: str, count: int) -> list[dict[str, Any]]:
        batch = self._batches.get(batch_id)
        if not batch:
            return []
        
        if "retailUnits" not in batch:
            batch["retailUnits"] = []
            
        start_index = len(batch["retailUnits"]) + 1
        new_units = []
        for i in range(count):
            unit_id = f"{batch_id}-{start_index + i:03d}"
            unit = {
                "id": unit_id,
                "batchId": batch_id,
                "isScanned": False,
                "scannedAt": None
            }
            batch["retailUnits"].append(unit)
            new_units.append(unit)
            
        return deepcopy(new_units)
        
    def get_retail_unit(self, unit_id: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
        """Returns (batch, unit) or (None, None). Also marks it as scanned if it wasn't."""
        if "-" not in unit_id:
            return None, None
            
        batch_id = unit_id.rsplit("-", 1)[0]
        batch = self._batches.get(batch_id)
        if not batch or "retailUnits" not in batch:
            return None, None
            
        for unit in batch["retailUnits"]:
            if unit["id"] == unit_id:
                # We found it. We return a copy of the batch, and a copy of the unit as it WAS before marking it scanned
                # Wait, actually we should mark it scanned and return its current state.
                current_state = deepcopy(unit)
                
                # Mark as scanned for future queries
                from datetime import datetime, timezone
                if not unit["isScanned"]:
                    unit["isScanned"] = True
                    unit["scannedAt"] = datetime.now(timezone.utc).isoformat()
                    
                return deepcopy(batch), current_state
                
        return None, None


batch_store = BatchStore()
