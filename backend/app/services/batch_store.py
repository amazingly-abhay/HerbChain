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


batch_store = BatchStore()
