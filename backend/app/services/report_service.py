"""Report generation and hashing service.

- Main Report: auto-generated when lab testing passes. Contains batch metadata,
  full event history up to testing, lab test results, and AI analysis if present.
  Its SHA-256 hash is stored on-chain for immutability verification.
- Secondary Reports: generated for post-testing events (shipment, retail).
  Stored in the persistent DB only.
"""

import hashlib
import json
from copy import deepcopy
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def _deterministic_json(data: dict) -> str:
    """Produce a deterministic JSON string for consistent hashing."""
    return json.dumps(data, sort_keys=True, default=str, ensure_ascii=False)


def generate_main_report(batch: dict[str, Any]) -> dict[str, Any]:
    """Build the main report after lab testing passes.

    The report includes batch metadata, all events up to and including
    the testing stage, lab test results, and the AI analysis if present.
    A SHA-256 hash of the report payload is computed for blockchain storage.
    """
    # Build compact report data
    report_data = {
        "batch_id": batch["id"],
        "herb_name": batch.get("herbName", ""),
        "scientific_name": batch.get("scientificName", ""),
        "quantity": batch.get("quantity", 0),
        "unit": batch.get("unit", "kg"),
        "origin": batch.get("origin", {}),
        "collector_name": batch.get("collectorName", ""),
        "created_at": batch.get("createdAt", ""),
        "events": [],
        "lab_test": None,
        "ai_analysis": batch.get("aiAnalysis"),
    }

    # Include all events up to and including testing
    testing_stages = {"collection", "processing", "testing"}
    for event in batch.get("events", []):
        if event.get("stage") in testing_stages:
            report_data["events"].append({
                "stage": event.get("stage"),
                "actor_name": event.get("actorName"),
                "actor_role": event.get("actorRole"),
                "timestamp": event.get("timestamp"),
                "location": event.get("location"),
                "notes": event.get("notes"),
            })

    # Extract lab test data from the testing event
    testing_event = None
    for event in batch.get("events", []):
        if event.get("stage") == "testing":
            testing_event = event
            break

    if testing_event:
        report_data["lab_test"] = {
            "tester_name": testing_event.get("actorName"),
            "timestamp": testing_event.get("timestamp"),
            "location": testing_event.get("location"),
            "result": testing_event.get("labResult", "passed"),
            "parameters": testing_event.get("labParameters", {}),
            "notes": testing_event.get("notes", ""),
        }

    # Hash the report for blockchain
    report_json = _deterministic_json(report_data)
    report_hash = hashlib.sha256(report_json.encode("utf-8")).hexdigest()

    report = {
        "id": f"RPT-{uuid4().hex[:10]}",
        "batchId": batch["id"],
        "type": "main",
        "stage": "testing",
        "data": report_data,
        "hash": report_hash,
        "blockchainTxHash": None,  # filled later by blockchain service
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    return report


def generate_secondary_report(batch: dict[str, Any], event: dict[str, Any]) -> dict[str, Any]:
    """Build a secondary report for a post-testing event (shipment/retail)."""
    report_data = {
        "batch_id": batch["id"],
        "herb_name": batch.get("herbName", ""),
        "current_stage": event.get("stage"),
        "event": {
            "stage": event.get("stage"),
            "actor_name": event.get("actorName"),
            "actor_role": event.get("actorRole"),
            "timestamp": event.get("timestamp"),
            "location": event.get("location"),
            "notes": event.get("notes"),
        },
        "main_report_hash": None,
    }

    # Include reference to main report hash for traceability
    main_report = batch.get("mainReport")
    if main_report:
        report_data["main_report_hash"] = main_report.get("hash")

    report = {
        "id": f"RPT-{uuid4().hex[:10]}",
        "batchId": batch["id"],
        "type": "secondary",
        "stage": event.get("stage"),
        "data": report_data,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    return report
