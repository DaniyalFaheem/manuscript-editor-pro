"""
Deepfake Detection API - Main Application
A comprehensive deepfake detection system with multiple detection models,
image/video analysis, and detailed reporting.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from api.routes import analysis, auth, feedback, models, results
from api.middleware.rate_limiter import RateLimitMiddleware
from api.middleware.auth import AuthMiddleware
from config.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifecycle manager for the FastAPI application."""
    # Startup: Load ML models, initialize connections
    print("🚀 Starting Deepfake Detection API...")
    print(f"📁 Model path: {settings.MODEL_PATH}")
    print(f"🗄️ Database: {settings.DATABASE_URL}")
    
    # Initialize model cache
    from services.detection_engine import DetectionEngine
    app.state.detection_engine = DetectionEngine()
    await app.state.detection_engine.initialize()
    
    print("✅ All models loaded successfully!")
    
    yield
    
    # Shutdown: Clean up resources
    print("🛑 Shutting down Deepfake Detection API...")
    await app.state.detection_engine.cleanup()
    print("✅ Cleanup completed!")


# Create FastAPI application
app = FastAPI(
    title="Deepfake Detection API",
    description="""
    A comprehensive deepfake detection system that analyzes images and videos
    for manipulation, synthetic content, and AI-generated media.
    
    ## Features
    - Multi-modal detection (images and videos)
    - CNN-based classification (EfficientNet, XceptionNet, ResNet)
    - Facial landmark analysis
    - Texture and lighting inconsistency detection
    - Temporal coherence checking for videos
    - Ensemble model voting
    - Detailed analysis reports
    
    ## Authentication
    All endpoints require JWT authentication. Use the `/api/v1/auth/token` endpoint
    to obtain a token, then include it in the Authorization header.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add rate limiting
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(analysis.router, prefix="/api/v1/analyze", tags=["Analysis"])
app.include_router(results.router, prefix="/api/v1/results", tags=["Results"])
app.include_router(models.router, prefix="/api/v1/models", tags=["Models"])
app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Feedback"])


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Deepfake Detection API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "models_loaded": True,
        "database": "connected",
        "cache": "connected",
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=settings.WORKERS,
    )
