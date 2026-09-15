from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from app.core.auth import get_current_user
from app.core.database import get_supabase_client
from app.services.main_service import DocumentService
from app.schemas.responses import DocumentUploadResponse, DocumentResponse
from typing import List

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    allowed = {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
    import os
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

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
async def process_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    try:
        result = await service.process_document(document_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Document processing failed")


@router.get("", response_model=List[DocumentResponse])
async def list_documents(user: dict = Depends(get_current_user)):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    docs = await service.get_documents(user["user_id"])
    return docs


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    doc = await service.get_document(document_id, user["user_id"])
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase_client()
    service = DocumentService(supabase)
    await service.delete_document(document_id, user["user_id"])
    return {"message": "Document deleted"}
