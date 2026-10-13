from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import (
    UserCreate, UserResponse, UserInDB, OnboardingSubmit, WalletSubmit,
    ProfileUpdate, KYCSubmit, SettingsUpdate, PasswordChange
)
from app.middleware.auth import get_password_hash, verify_password, create_access_token, get_current_user, TokenData
from app.database import get_db
from datetime import timedelta

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db = Depends(get_db)):
    # Check if user exists
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    existing_username = await db.users.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Create new user
    hashed_password = get_password_hash(user.password)
    user_dict = user.model_dump()
    del user_dict["password"]
    user_dict["hashed_password"] = hashed_password
    user_dict["onboarding_completed"] = False
    user_dict["kyc_status"] = "pending"
    
    from datetime import datetime
    user_dict["created_at"] = datetime.utcnow()
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    created_user["id"] = str(created_user["_id"])
    return created_user

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db = Depends(get_db)):
    user = await db.users.find_one({"$or": [
        {"username": form_data.username}, {"email": form_data.username}
    ]})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = create_access_token(
        data={
            "sub": user["username"],
            "role": user.get("role"),
            "id": str(user["_id"]),
            "name": user.get("name") or user["username"],
            "email": user["email"],
            "onboarding_completed": user.get("onboarding_completed", False),
        },
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["id"] = str(user["_id"])
    return user

@router.post("/onboarding", response_model=UserResponse)
async def onboarding(data: OnboardingSubmit, current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {
        "role": data.role,
        "location": data.location,
        "government_id_type": data.government_id_type,
        "government_id_number": data.government_id_number,
        "onboarding_completed": True,
        "kyc_status": "verified" # Auto-verifying for prototype
    }
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user

@router.post("/wallet", response_model=UserResponse)
async def connect_wallet(data: WalletSubmit, current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"wallet_address": data.wallet_address}}
    )
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user

@router.put("/profile", response_model=UserResponse)
async def update_profile(data: ProfileUpdate, current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_dict:
        await db.users.update_one({"_id": user["_id"]}, {"$set": update_dict})
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user

@router.post("/kyc", response_model=UserResponse)
async def update_kyc(data: KYCSubmit, current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {
        "government_id_type": data.government_id_type,
        "government_id_number": data.government_id_number,
        "kyc_status": "verified" # Auto-verify for prototype
    }
    if data.document_hash:
        update_data["kyc_document_hash"] = data.document_hash
        
    await db.users.update_one({"_id": user["_id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user

@router.put("/settings", response_model=UserResponse)
async def update_settings(data: SettingsUpdate, current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing_settings = user.get("settings") or {}
    merged_settings = {**existing_settings, **data.settings}
    
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"settings": merged_settings}})
    
    updated_user = await db.users.find_one({"_id": user["_id"]})
    updated_user["id"] = str(updated_user["_id"])
    return updated_user

@router.post("/change-password")
async def change_password(data: PasswordChange, current_user: TokenData = Depends(get_current_user), db=Depends(get_db)):
    user = await db.users.find_one({"username": current_user.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not verify_password(data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
    new_hash = get_password_hash(data.new_password)
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"hashed_password": new_hash}})
    return {"message": "Password updated successfully"}


