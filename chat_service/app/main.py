"""
FastAPI main application for Chat Service
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS
from app.api import chat, upload, scam

app = FastAPI(
    title="FinPilot Chat Service",
    version="1.0.0",
    description="AI chatbot, file upload, and scam detection service"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/ws", tags=["chat"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(scam.router, prefix="/api/scam", tags=["scam"])


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chat_service"}


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "FinPilot Chat Service",
        "version": "1.0.0",
        "endpoints": {
            "websocket": "/ws/chat",
            "upload": "/api/upload",
            "scam_check": "/api/scam/check"
        }
    }

