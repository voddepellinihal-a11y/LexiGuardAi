from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api import documents, analysis, chat, comparisons, consultation, health
import structlog
import uuid

logger = structlog.get_logger()

app = FastAPI(
    title="LexiGuard AI",
    description="AI-Powered Legal Assistance & Contract Intelligence Platform",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred.",
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


app.include_router(health.router, prefix="/api/v1")
app.include_router(documents.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(comparisons.router, prefix="/api/v1")
app.include_router(consultation.router, prefix="/api/v1")
