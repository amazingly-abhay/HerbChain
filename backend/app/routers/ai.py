from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.batch import PlantAnalysisRequest, PlantAnalysisResponse
from app.services.gemini_service import gemini_service
from app.config import settings
import base64

router = APIRouter(prefix="/api/ai", tags=["ai"])


def demo_analysis():
    """Keeps the connected UI usable when Gemini is not configured."""
    return {
        "plantIdentification": {"name": "Medicinal plant", "scientificName": "Identification pending", "confidence": 0.0},
        "healthRating": 0,
        "diseases": [],
        "pests": [],
        "harvestReadiness": {"ready": False, "notes": "Add GEMINI_API_KEY for an AI assessment."},
        "recommendations": ["Configure Gemini to analyze uploaded images."],
    }

@router.post("/analyze")
async def analyze_plant(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    content = await file.read()
    image_b64 = base64.b64encode(content).decode('utf-8')
    
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "mock_key":
        return demo_analysis()

    try:
        analysis_result = await gemini_service.analyze_plant_image(image_b64)
        # Parse the JSON response from Gemini
        import json
        
        try:
            # Try to extract JSON from markdown if present
            if "```json" in analysis_result:
                json_str = analysis_result.split("```json")[1].split("```")[0].strip()
            else:
                json_str = analysis_result.strip()
                
            data = json.loads(json_str)
            return {
                "plantIdentification": {
                    "name": data.get("identification", data.get("name", "Unknown")),
                    "scientificName": data.get("scientific_name", data.get("scientificName", "")),
                    "confidence": float(data.get("confidence", 0)),
                },
                "healthRating": float(data.get("overall_health", data.get("healthRating", 0))),
                "diseases": data.get("diseases", []),
                "pests": data.get("pests", []),
                "harvestReadiness": data.get("harvestReadiness", {"ready": False, "notes": "No harvest assessment returned."}),
                "recommendations": data.get("recommendations", []),
            }
        except:
            return demo_analysis()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
