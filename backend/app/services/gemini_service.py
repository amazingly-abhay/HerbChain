import base64
from google import genai
from google.genai import types
from app.config import settings
from tenacity import retry, stop_after_attempt, wait_exponential

class GeminiService:
    def __init__(self):
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "mock_key":
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                print(f"Failed to initialize Gemini client: {e}")
                self.client = None
        else:
            self.client = None
        # High speed flash-lite model (1.9s avg response)
        self.model_name = "gemini-3.5-flash-lite"
        self.fallback_model = "gemini-3-flash-preview"

    async def analyze_plant_image(self, image_base64: str):
        if not self.client:
            raise Exception("Gemini client not initialized (no API key provided)")

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
        
        # Try primary fast model, then fallback
        models_to_try = [self.model_name, self.fallback_model]
        last_error = None

        for model in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                        prompt,
                    ],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                    ),
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Model {model} analysis attempt failed: {e}")
                last_error = e
                continue

        raise Exception(f"Failed to analyze image across models: {last_error}")

gemini_service = GeminiService()
