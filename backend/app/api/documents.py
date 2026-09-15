import os
from uuid import UUID
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.core.config import settings
from app.services.main_service import DocumentService
from app.schemas.responses import DocumentUploadResponse, DocumentResponse
from typing import List

router = APIRouter(prefix="/documents", tags=["documents"])
limiter = Limiter(key_func=get_remote_address)


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    allowed = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
    ext = os.path.splitext(os.path.basename(file.filename))[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail="File too large")

    supabase = get_supabase_client()
    service = DocumentService(supabase)
    doc = await service.upload_document(user["user_id"], content, file.filename)

    return DocumentUploadResponse(
        id=doc["id"],
        filename=doc["filename"],
        status=doc["status"],
        created_at=doc["created_at"],
    )


@router.post("/{document_id}/process")
@limiter.limit("5/minute")
async def process_document(
    request: Request,
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    try:
        result = await service.process_document(str(document_id), user["user_id"])
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Document processing failed")


@router.get("", response_model=List[DocumentResponse])
async def list_documents(user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    docs = await service.get_documents(user["user_id"])
    return docs


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    doc = await service.get_document(str(document_id), user["user_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {k: v for k, v in doc.items() if k != "processing_error" or True}


@router.delete("/{document_id}")
@limiter.limit("10/minute")
async def delete_document(
    request: Request,
    document_id: UUID,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    await service.delete_document(str(document_id), user["user_id"])
    return {"message": "Document deleted"}
