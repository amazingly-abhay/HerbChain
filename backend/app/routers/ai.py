from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.batch import PlantAnalysisRequest, PlantAnalysisResponse
from app.services.gemini_service import gemini_service
from app.config import settings
import base64

router = APIRouter(prefix="/api/ai", tags=["ai"])


def demo_analysis(error_message: str = None):
    """Keeps the connected UI usable when Gemini is not configured or fails."""
    notes = "Add GEMINI_API_KEY for an AI assessment."
    recommendations = ["Configure Gemini to analyze uploaded images."]
    if error_message:
        notes = "AI Service temporarily unavailable."
        recommendations = [f"Analysis failed: {error_message}"]

    return {
        "plantIdentification": {"name": "Medicinal plant", "scientificName": "Identification pending", "confidence": 0.0},
        "healthRating": 0,
        "diseases": [],
        "pests": [],
        "harvestReadiness": {"ready": False, "notes": notes},
        "recommendations": recommendations,
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
            
            # Robustly extract name to handle cases where 'identification' might still be returned as a dict
            name = data.get("name")
            if not isinstance(name, str):
                name = str(data.get("identification", "Unknown"))
                
            # Robustly extract health rating
            raw_health = data.get("healthRating", data.get("overall_health", 0))
            if isinstance(raw_health, dict):
                health_rating = float(raw_health.get("score", 0) or 0)
            else:
                try:
                    health_rating = float(raw_health or 0)
                except (ValueError, TypeError):
                    health_rating = 0.0
                
            return {
                "plantIdentification": {
                    "name": name,
                    "scientificName": str(data.get("scientificName", data.get("scientific_name", ""))),
                    "confidence": float(data.get("confidence", 0)),
                },
                "healthRating": health_rating,
                "diseases": data.get("diseases", []),
                "pests": data.get("pests", []),
                "harvestReadiness": data.get("harvestReadiness", {"ready": False, "notes": "No harvest assessment returned."}),
                "recommendations": data.get("recommendations", []),
            }
        except Exception as parse_error:
            print(f"Error parsing Gemini response: {parse_error}. Response was: {analysis_result}")
            # Fall back to demo analysis only if it's completely unparseable
            return demo_analysis("Could not parse AI response.")
            
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fall back gracefully to avoid 500 errors in UI
        return demo_analysis("API request failed (e.g., rate limited). Please try again later.")
