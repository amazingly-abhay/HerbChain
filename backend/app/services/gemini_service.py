import base64
from google import genai
from google.genai import types
from app.config import settings

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = "gemini-1.5-flash"

    async def analyze_plant_image(self, image_base64: str):
        try:
            # Decode the base64 image
            image_bytes = base64.b64decode(image_base64)
            
            prompt = """
            Analyze this medicinal plant image and provide:
            - Identification and scientific name
            - Overall health (0.0 to 10.0)
            - Visible symptoms or diseases
            - Quality rating
            - Harvest readiness and recommendations
            Format the response as a clear, structured JSON.
            """
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    prompt,
                ],
            )
            return response.text
        except Exception as e:
            raise Exception(f"Failed to analyze image: {e}")

gemini_service = GeminiService()
