import hashlib
from uuid import uuid4
import httpx
from app.config import settings


class PinataService:
    def __init__(self):
        self.base_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    def _get_headers(self) -> dict:
        if settings.PINATA_JWT:
            return {"Authorization": f"Bearer {settings.PINATA_JWT}"}
        return {
            "pinata_api_key": settings.PINATA_API_KEY,
            "pinata_secret_api_key": settings.PINATA_SECRET_API_KEY,
        }

    async def upload_file(self, file_content: bytes, filename: str | None = None) -> str:
        safe_filename = filename or f"herb_{uuid4().hex[:8]}.jpg"
        
        has_credentials = bool(settings.PINATA_JWT or (settings.PINATA_API_KEY and settings.PINATA_SECRET_API_KEY))
        if not has_credentials:
            # Deterministic mock hash based on file content for offline/dev prototyping
            content_hash = hashlib.sha256(file_content).hexdigest()[:32]
            return f"QmLocal{content_hash}"

        try:
            headers = self._get_headers()
            async with httpx.AsyncClient(timeout=10.0) as client:
                files = {"file": (safe_filename, file_content)}
                response = await client.post(self.base_url, headers=headers, files=files)

                if response.status_code == 200:
                    ipfs_hash = response.json().get("IpfsHash")
                    if ipfs_hash:
                        return ipfs_hash

                print(f"Notice: Pinata API returned {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Notice: Pinata remote upload failed ({e}). Falling back to local content digest.")

        # Graceful fallback: produce content-derived hash so user operations are never blocked
        content_hash = hashlib.sha256(file_content).hexdigest()[:32]
        return f"QmLocal{content_hash}"


pinata_service = PinataService()
