from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    location: Optional[str] = None
    role: Optional[str] = None # collector, processor, tester, shipper, retailer, admin

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

class KYCSubmit(BaseModel):
    government_id_type: str
    government_id_number: str
    document_hash: str # IPFS hash for document

class OnboardingSubmit(BaseModel):
    role: str
    location: str
    government_id_type: str
    government_id_number: str
