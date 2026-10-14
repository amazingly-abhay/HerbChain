from datetime import datetime
from typing import Optional, Dict, Any
from uuid import uuid4

async def record_audit_log(
    db,
    admin_id: str,
    admin_username: str,
    action: str,
    target_resource: str,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> dict:
    """
    Persist an administrative action or security audit log entry.
    """
    log_entry = {
        "id": f"AUD-{uuid4().hex[:10].upper()}",
        "timestamp": datetime.utcnow().isoformat(),
        "admin_id": str(admin_id),
        "admin_username": admin_username,
        "action": action,
        "target_resource": target_resource,
        "details": details or {},
        "ip_address": ip_address or "127.0.0.1"
    }
    
    await db.audit_logs.insert_one(log_entry)
    # Exclude MongoDB _id from returned record
    log_entry.pop("_id", None)
    return log_entry

async def get_audit_logs(
    db,
    limit: int = 100,
    skip: int = 0,
    action: Optional[str] = None,
    search: Optional[str] = None
) -> list:
    """
    Fetch paginated audit logs with optional filtering.
    """
    query: Dict[str, Any] = {}
    if action:
        query["action"] = action
    if search:
        query["$or"] = [
            {"admin_username": {"$regex": search, "$options": "i"}},
            {"target_resource": {"$regex": search, "$options": "i"}},
            {"action": {"$regex": search, "$options": "i"}}
        ]
        
    cursor = db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)
