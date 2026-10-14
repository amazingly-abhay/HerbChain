from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from bson import ObjectId

from app.database import get_db
from app.config import settings
from app.models.user import (
    UserResponse, Token, TokenData,
    AdminBootstrapRequest, AdminUserRoleUpdate,
    AdminUserStatusUpdate, AdminKYCUpdate, SystemConfigModel
)
from app.middleware.auth import (
    get_password_hash, verify_password,
    create_access_token, get_current_admin
)
from app.services.audit_service import record_audit_log, get_audit_logs

router = APIRouter(prefix="/api/admin", tags=["admin"])

# ============================================================================
# 1. Admin Authentication & Bootstrap
# ============================================================================

@router.post("/auth/bootstrap", response_model=UserResponse)
async def bootstrap_admin(data: AdminBootstrapRequest, request: Request, db = Depends(get_db)):
    """
    Bootstrap the initial root administrator account using the secure bootstrap secret.
    """
    if data.bootstrap_secret != settings.ADMIN_BOOTSTRAP_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid bootstrap secret key."
        )

    # Check existing username / email
    existing_email = await db.users.find_one({"email": data.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = await db.users.find_one({"username": data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = get_password_hash(data.password)
    admin_doc = {
        "username": data.username,
        "email": data.email,
        "name": data.name,
        "role": "admin",
        "hashed_password": hashed_password,
        "is_active": True,
        "onboarding_completed": True,
        "kyc_status": "verified",
        "created_at": datetime.utcnow(),
        "organization": "HerbChain Administration",
        "location": "Central Operations",
    }

    result = await db.users.insert_one(admin_doc)
    created_id = str(result.inserted_id)

    client_ip = request.client.host if request.client else "127.0.0.1"
    await record_audit_log(
        db=db,
        admin_id=created_id,
        admin_username=data.username,
        action="ADMIN_BOOTSTRAP",
        target_resource=f"user/{created_id}",
        details={"email": data.email, "role": "admin"},
        ip_address=client_ip
    )

    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["id"] = created_id
    return created_user


@router.post("/auth/login")
async def admin_login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db = Depends(get_db)
):
    """
    Dedicated admin login. Requires valid credentials, role == 'admin', and active status.
    """
    user = await db.users.find_one({
        "$or": [{"username": form_data.username}, {"email": form_data.username}]
    })

    if not user or not verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Account does not possess administrative privileges."
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator account is currently deactivated."
        )

    client_ip = request.client.host if request.client else "127.0.0.1"
    user_id = str(user["_id"])

    # Record login in audit logs
    await record_audit_log(
        db=db,
        admin_id=user_id,
        admin_username=user["username"],
        action="ADMIN_LOGIN",
        target_resource=f"admin/{user_id}",
        details={"email": user["email"]},
        ip_address=client_ip
    )

    access_token = create_access_token(
        data={
            "sub": user["username"],
            "role": "admin",
            "id": user_id,
            "name": user.get("name") or user["username"],
            "email": user["email"],
            "onboarding_completed": True,
            "is_admin": True,
        },
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "username": user["username"],
            "name": user.get("name") or user["username"],
            "email": user["email"],
            "role": "admin",
            "is_admin": True,
        }
    }


# ============================================================================
# 2. User Management
# ============================================================================

@router.get("/users")
async def list_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    kyc_status: Optional[str] = None,
    is_active: Optional[bool] = None,
    limit: int = 50,
    skip: int = 0,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    List platform users with optional search, role, kyc, and status filters.
    """
    query: Dict[str, Any] = {}
    if role:
        query["role"] = role
    if kyc_status:
        query["kyc_status"] = kyc_status
    if is_active is not None:
        query["is_active"] = is_active
    if search:
        query["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"name": {"$regex": search, "$options": "i"}},
            {"organization": {"$regex": search, "$options": "i"}},
        ]

    total_count = await db.users.count_documents(query)
    cursor = db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
    users = []
    async for u in cursor:
        u["id"] = str(u["_id"])
        u.pop("hashed_password", None)
        u.pop("_id", None)
        users.append(u)

    return {
        "total": total_count,
        "limit": limit,
        "skip": skip,
        "users": users
    }


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Retrieve in-depth details of a user including their supply chain activity.
    """
    query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"_id": ObjectId(user_id)})

    user = await db.users.find_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    user.pop("hashed_password", None)
    user.pop("_id", None)

    # Fetch user's batches or events
    user_batches = await db.batches.find({
        "$or": [
            {"collectorId": user["id"]},
            {"events.actorId": user["id"]}
        ]
    }, {"_id": 0}).limit(20).to_list(length=20)

    # Fetch recent audit logs targeting this user
    user_audit_logs = await db.audit_logs.find({
        "target_resource": f"user/{user['id']}"
    }, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(length=10)

    return {
        "user": user,
        "batches": user_batches,
        "audit_logs": user_audit_logs
    }


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    payload: AdminUserRoleUpdate,
    request: Request,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Change a user's role (promote/demote/assign).
    """
    valid_roles = {"collector", "processor", "tester", "shipper", "retailer", "admin"}
    if payload.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Allowed: {valid_roles}")

    query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"_id": ObjectId(user_id)})

    target_user = await db.users.find_one(query)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = target_user.get("role")
    await db.users.update_one(
        {"_id": target_user["_id"]},
        {"$set": {"role": payload.role}}
    )

    client_ip = request.client.host if request.client else "127.0.0.1"
    await record_audit_log(
        db=db,
        admin_id=admin.id or "admin",
        admin_username=admin.username or "admin",
        action="USER_ROLE_CHANGED",
        target_resource=f"user/{str(target_user['_id'])}",
        details={
            "target_username": target_user["username"],
            "old_role": old_role,
            "new_role": payload.role
        },
        ip_address=client_ip
    )

    return {"message": f"User role updated from {old_role} to {payload.role}"}


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: AdminUserStatusUpdate,
    request: Request,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Activate or suspend a user account.
    """
    query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"_id": ObjectId(user_id)})

    target_user = await db.users.find_one(query)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Prevent admin from suspending themselves
    if str(target_user["_id"]) == admin.id or target_user["username"] == admin.username:
        raise HTTPException(status_code=400, detail="Administrators cannot suspend their own account.")

    await db.users.update_one(
        {"_id": target_user["_id"]},
        {"$set": {"is_active": payload.is_active}}
    )

    action_name = "USER_ACTIVATED" if payload.is_active else "USER_SUSPENDED"
    client_ip = request.client.host if request.client else "127.0.0.1"
    await record_audit_log(
        db=db,
        admin_id=admin.id or "admin",
        admin_username=admin.username or "admin",
        action=action_name,
        target_resource=f"user/{str(target_user['_id'])}",
        details={
            "target_username": target_user["username"],
            "is_active": payload.is_active
        },
        ip_address=client_ip
    )

    status_str = "activated" if payload.is_active else "suspended"
    return {"message": f"User account has been {status_str}."}


@router.put("/users/{user_id}/kyc")
async def update_user_kyc(
    user_id: str,
    payload: AdminKYCUpdate,
    request: Request,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Approve, reject, or mark pending a user's KYC verification.
    """
    valid_statuses = {"verified", "rejected", "pending"}
    if payload.kyc_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid KYC status. Allowed: {valid_statuses}")

    query = {"$or": [{"id": user_id}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"_id": ObjectId(user_id)})

    target_user = await db.users.find_one(query)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    old_status = target_user.get("kyc_status", "pending")
    update_fields: Dict[str, Any] = {"kyc_status": payload.kyc_status}
    if payload.notes:
        update_fields["kyc_admin_notes"] = payload.notes

    await db.users.update_one(
        {"_id": target_user["_id"]},
        {"$set": update_fields}
    )

    client_ip = request.client.host if request.client else "127.0.0.1"
    await record_audit_log(
        db=db,
        admin_id=admin.id or "admin",
        admin_username=admin.username or "admin",
        action="KYC_STATUS_UPDATED",
        target_resource=f"user/{str(target_user['_id'])}",
        details={
            "target_username": target_user["username"],
            "old_status": old_status,
            "new_status": payload.kyc_status,
            "notes": payload.notes
        },
        ip_address=client_ip
    )

    return {"message": f"KYC status updated to {payload.kyc_status}."}


# ============================================================================
# 3. Audit Logs
# ============================================================================

@router.get("/audit-logs")
async def fetch_audit_logs(
    action: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    skip: int = 0,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Retrieve security and administrative audit logs with filtering.
    """
    logs = await get_audit_logs(db=db, limit=limit, skip=skip, action=action, search=search)
    total = await db.audit_logs.count_documents({})
    return {"total": total, "logs": logs}


# ============================================================================
# 4. System Configuration
# ============================================================================

@router.get("/config", response_model=SystemConfigModel)
async def get_system_config(
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Get dynamic platform governance configurations.
    """
    doc = await db.system_config.find_one({"key": "main"}, {"_id": 0})
    if not doc:
        return SystemConfigModel()
    return SystemConfigModel(**doc.get("config", {}))


@router.put("/config", response_model=SystemConfigModel)
async def update_system_config(
    payload: SystemConfigModel,
    request: Request,
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Update platform governance configurations (thresholds, policies).
    """
    config_dict = payload.model_dump()
    await db.system_config.update_one(
        {"key": "main"},
        {"$set": {"config": config_dict, "updated_at": datetime.utcnow()}},
        upsert=True
    )

    client_ip = request.client.host if request.client else "127.0.0.1"
    await record_audit_log(
        db=db,
        admin_id=admin.id or "admin",
        admin_username=admin.username or "admin",
        action="SYSTEM_CONFIG_UPDATED",
        target_resource="system_config/main",
        details=config_dict,
        ip_address=client_ip
    )

    return payload


# ============================================================================
# 5. Business & Analytics Stats
# ============================================================================

@router.get("/analytics")
async def get_admin_analytics(
    admin: TokenData = Depends(get_current_admin),
    db = Depends(get_db)
):
    """
    Compute comprehensive business, operational, and supply-chain metrics.
    """
    batches_cursor = db.batches.find({}, {"_id": 0})
    batches = await batches_cursor.to_list(length=1000)

    users_cursor = db.users.find({}, {"_id": 0, "role": 1, "is_active": 1, "kyc_status": 1})
    users = await users_cursor.to_list(length=2000)

    # 1. Volume & Herb breakdown
    herb_stats: Dict[str, Dict[str, Any]] = {}
    total_quantity_kg = 0.0

    stage_counts = {
        "collection": 0,
        "processing": 0,
        "testing": 0,
        "shipment": 0,
        "retail": 0,
    }

    testing_counts = {
        "passed": 0,
        "failed": 0,
        "pending": 0,
    }

    manual_checks_required = 0
    total_events = 0

    for b in batches:
        h_name = b.get("herbName", "Unknown")
        qty = float(b.get("quantity", 0) or 0)
        unit = b.get("unit", "kg").lower()
        # normalize to kg approximately
        norm_qty = qty
        if unit == "g":
            norm_qty = qty / 1000.0
        elif unit == "quintal":
            norm_qty = qty * 100.0
        elif unit == "ton":
            norm_qty = qty * 1000.0

        total_quantity_kg += norm_qty

        if h_name not in herb_stats:
            herb_stats[h_name] = {"name": h_name, "quantity_kg": 0.0, "batch_count": 0}
        herb_stats[h_name]["quantity_kg"] += norm_qty
        herb_stats[h_name]["batch_count"] += 1

        stage = b.get("currentStage", "collection")
        if stage in stage_counts:
            stage_counts[stage] += 1

        t_status = b.get("testingStatus", "pending")
        if t_status in testing_counts:
            testing_counts[t_status] += 1
        else:
            testing_counts["pending"] += 1

        if b.get("manualCheckRequired"):
            manual_checks_required += 1

        total_events += len(b.get("events", []))

    # Top herbs by volume
    top_herbs = sorted(herb_stats.values(), key=lambda x: x["quantity_kg"], reverse=True)[:6]

    # 2. User & Actor Distribution
    role_counts = {
        "collector": 0,
        "processor": 0,
        "tester": 0,
        "shipper": 0,
        "retailer": 0,
        "admin": 0,
    }
    kyc_counts = {"verified": 0, "pending": 0, "rejected": 0}
    active_users = 0
    inactive_users = 0

    for u in users:
        r = u.get("role")
        if r in role_counts:
            role_counts[r] += 1
        
        k = u.get("kyc_status", "pending")
        if k in kyc_counts:
            kyc_counts[k] += 1
        
        if u.get("is_active", True):
            active_users += 1
        else:
            inactive_users += 1

    # Quality Pass Rate
    total_tested = testing_counts["passed"] + testing_counts["failed"]
    pass_rate = round((testing_counts["passed"] / total_tested * 100), 1) if total_tested > 0 else 100.0

    # Recent Audit Logs
    recent_logs = await db.audit_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(length=5)

    return {
        "overview": {
            "total_batches": len(batches),
            "total_herb_mass_kg": round(total_quantity_kg, 2),
            "total_events": total_events,
            "total_users": len(users),
            "active_users": active_users,
            "inactive_users": inactive_users,
            "pass_rate_percentage": pass_rate,
            "manual_checks_required": manual_checks_required,
        },
        "stage_funnel": [
            {"stage": "collection", "label": "Collection", "count": stage_counts["collection"]},
            {"stage": "processing", "label": "Processing", "count": stage_counts["processing"]},
            {"stage": "testing", "label": "Testing", "count": stage_counts["testing"]},
            {"stage": "shipment", "label": "Shipment", "count": stage_counts["shipment"]},
            {"stage": "retail", "label": "Retail", "count": stage_counts["retail"]},
        ],
        "quality_distribution": [
            {"name": "Passed", "value": testing_counts["passed"], "color": "#10b981"},
            {"name": "Failed", "value": testing_counts["failed"], "color": "#ef4444"},
            {"name": "Pending", "value": testing_counts["pending"], "color": "#f59e0b"},
        ],
        "top_herbs": top_herbs,
        "role_breakdown": [
            {"role": "collector", "label": "Collector", "count": role_counts["collector"]},
            {"role": "processor", "label": "Processor", "count": role_counts["processor"]},
            {"role": "tester", "label": "Tester", "count": role_counts["tester"]},
            {"role": "shipper", "label": "Shipper", "count": role_counts["shipper"]},
            {"role": "retailer", "label": "Retailer", "count": role_counts["retailer"]},
            {"role": "admin", "label": "Admin", "count": role_counts["admin"]},
        ],
        "kyc_breakdown": kyc_counts,
        "recent_audit_logs": recent_logs,
    }
