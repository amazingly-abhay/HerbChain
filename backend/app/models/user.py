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
    settings: Optional[dict] = None

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    onboarding_completed: bool = False
    kyc_status: str = "pending"
    
class UserResponse(UserBase):
    id: str
    created_at: datetime
    onboarding_completed: bool = False
    kyc_status: str = "pending"

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
