import httpx
from app.config import settings

class PinataService:
    def __init__(self):
        self.base_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        self.headers = {
            "pinata_api_key": settings.PINATA_API_KEY,
            "pinata_secret_api_key": settings.PINATA_SECRET_API_KEY,
        }

    async def upload_file(self, file_content: bytes, filename: str):
        if not settings.PINATA_API_KEY:
            # Mock mode if no key
            return f"mock_ipfs_hash_for_{filename}"
            
        async with httpx.AsyncClient() as client:
            files = {'file': (filename, file_content)}
            response = await client.post(self.base_url, headers=self.headers, files=files)
            
            if response.status_code == 200:
                return response.json().get("IpfsHash")
            else:
                raise Exception(f"Pinata upload failed: {response.text}")

pinata_service = PinataService()
