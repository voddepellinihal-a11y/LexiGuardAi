from fastapi import APIRouter
from app.schemas.responses import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(status="healthy", version="1.0.0")
