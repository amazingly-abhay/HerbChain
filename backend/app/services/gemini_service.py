import base64
from google import genai
from google.genai import types
from app.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-3.8-flash"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10), reraise=True)
    async def analyze_plant_image(self, image_base64: str):
        try:
            # Decode the base64 image
            image_bytes = base64.b64decode(image_base64)
            
            prompt = """
            Analyze this medicinal plant image and provide an assessment.
            Format the response STRICTLY as a JSON object with EXACTLY these keys:
            - "name": (string) common name of the plant
            - "scientificName": (string) scientific name
            - "confidence": (float) a value between 0.0 and 1.0
            - "healthRating": (float) a value between 0.0 and 10.0
            - "diseases": (list of strings) visible diseases or symptoms
            - "pests": (list of strings) visible pests
            - "harvestReadiness": (object) with "ready" (boolean) and "notes" (string)
            - "recommendations": (list of strings) care or harvest recommendations
            """
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    prompt,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            return response.text
        except Exception as e:
            raise Exception(f"Failed to analyze image: {e}")

gemini_service = GeminiService()
