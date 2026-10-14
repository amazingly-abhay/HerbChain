from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: Optional[str] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    role: Optional[str] = None # collector, processor, tester, shipper, retailer, admin
    wallet_address: Optional[str] = None
    government_id_type: Optional[str] = None
    government_id_number: Optional[str] = None
    kyc_document_hash: Optional[str] = None
    is_active: bool = True
    settings: Optional[dict] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    onboarding_completed: bool = False
    kyc_status: str = "pending"
    is_active: bool = True
    
class UserResponse(UserBase):
    id: str
    created_at: datetime
    onboarding_completed: bool = False
    kyc_status: str = "pending"
    is_active: bool = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    is_admin: Optional[bool] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None
    organization: Optional[str] = None
    bio: Optional[str] = None

class KYCSubmit(BaseModel):
    government_id_type: str
    government_id_number: str
    document_hash: Optional[str] = None # IPFS hash or preview for document

class SettingsUpdate(BaseModel):
    settings: dict

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class OnboardingSubmit(BaseModel):
    role: str
    location: str
    government_id_type: str
    government_id_number: str

class WalletSubmit(BaseModel):
    wallet_address: str

class AdminBootstrapRequest(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str
    bootstrap_secret: str

class AdminUserRoleUpdate(BaseModel):
    role: str

class AdminUserStatusUpdate(BaseModel):
    is_active: bool

class AdminKYCUpdate(BaseModel):
    kyc_status: str # verified, rejected, pending
    notes: Optional[str] = None

class SystemConfigModel(BaseModel):
    min_purity_percent: float = Field(default=80.0, ge=0, le=100)
    max_moisture_percent: float = Field(default=12.0, ge=0, le=100)
    ai_confidence_threshold: float = Field(default=80.0, ge=0, le=100)
    maintenance_mode: bool = False
    auto_verify_kyc: bool = False
    allowed_units: list[str] = ["kg", "g", "quintal", "ton"]

