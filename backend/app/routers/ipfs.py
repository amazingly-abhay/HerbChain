from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ipfs_service import pinata_service

router = APIRouter(prefix="/api/ipfs", tags=["ipfs"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        ipfs_hash = await pinata_service.upload_file(content, file.filename)
        return {"ipfs_hash": ipfs_hash, "url": f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
