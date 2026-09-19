from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class StepCreate(BaseModel):
    stepType: int # 1: Processing, 2: Testing, 3: Shipment, 4: Retail
    actorId: str
    quality: str
    location: str
    action: str
    details: str

class BatchCreate(BaseModel):
    herbName: str
    quantity: int
    actorId: str
    quality: str
    location: str # lat,lon
    details: str

class BatchResponse(BaseModel):
    batchId: str
    txHash: str
    message: str

class PlantAnalysisRequest(BaseModel):
    image_base64: str
    location: Optional[str] = None

class PlantAnalysisResponse(BaseModel):
    identification: str
    scientific_name: str
    confidence: float
    overall_health: float
    visible_symptoms: List[str]
    diseases: List[str]
    quality_rating: str
    recommendations: str
