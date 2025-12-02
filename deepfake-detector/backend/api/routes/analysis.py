"""
Analysis routes for deepfake detection.
Handles image, video, URL, and batch analysis endpoints.
"""

import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from api.schemas import (
    AnalysisResponse,
    AnalysisResult,
    AnalysisStatus,
    AnalyzeURLRequest,
    BatchAnalyzeRequest,
    BatchAnalysisResponse,
    DetailedAnalysis,
    ErrorResponse,
    MediaType,
    ModelScore,
    ModelType,
    Prediction,
    TokenData,
)
from api.middleware.auth import get_current_user, require_auth
from config.settings import settings


router = APIRouter()


def validate_file_extension(filename: str, media_type: MediaType) -> bool:
    """Validate file extension based on media type."""
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    
    if media_type == MediaType.IMAGE:
        return ext in settings.ALLOWED_IMAGE_EXTENSIONS
    elif media_type == MediaType.VIDEO:
        return ext in settings.ALLOWED_VIDEO_EXTENSIONS
    
    return False


def get_media_type_from_extension(filename: str) -> Optional[MediaType]:
    """Determine media type from file extension."""
    ext = filename.lower().split(".")[-1] if "." in filename else ""
    
    if ext in settings.ALLOWED_IMAGE_EXTENSIONS:
        return MediaType.IMAGE
    elif ext in settings.ALLOWED_VIDEO_EXTENSIONS:
        return MediaType.VIDEO
    
    return None


async def perform_analysis(
    request: Request,
    file_content: bytes,
    filename: str,
    media_type: MediaType,
    models: Optional[List[ModelType]] = None,
    include_heatmap: bool = True,
) -> AnalysisResponse:
    """
    Perform deepfake analysis on the provided content.
    This is a mock implementation that simulates the detection process.
    """
    analysis_id = f"analysis_{uuid.uuid4().hex[:12]}"
    created_at = datetime.utcnow()
    
    # Get detection engine from app state
    detection_engine = getattr(request.app.state, "detection_engine", None)
    
    # Simulate analysis (in production, use actual ML models)
    import random
    
    # Generate mock scores for each model
    model_scores = {}
    models_to_use = models or [ModelType.EFFICIENTNET, ModelType.XCEPTIONNET, ModelType.ENSEMBLE]
    
    for model in models_to_use:
        score = random.uniform(0.3, 0.95)
        model_scores[model.value] = ModelScore(
            score=round(score, 3),
            prediction=Prediction.FAKE if score > 0.5 else Prediction.REAL,
            processing_time_ms=round(random.uniform(50, 300), 1),
        )
    
    # Calculate ensemble score
    avg_score = sum(m.score for m in model_scores.values()) / len(model_scores)
    is_deepfake = avg_score > settings.CONFIDENCE_THRESHOLD
    
    # Create detailed analysis
    detailed = DetailedAnalysis(
        facial_landmarks=None,  # Would be populated by actual analysis
        texture_analysis=None,
        metadata=None,
        temporal_analysis=None if media_type == MediaType.IMAGE else None,
    )
    
    # Create result
    result = AnalysisResult(
        is_deepfake=is_deepfake,
        confidence=round(avg_score, 3),
        prediction=Prediction.FAKE if is_deepfake else Prediction.REAL,
        models=model_scores,
        analysis=detailed,
    )
    
    completed_at = datetime.utcnow()
    processing_time = (completed_at - created_at).total_seconds() * 1000
    
    return AnalysisResponse(
        id=analysis_id,
        status=AnalysisStatus.COMPLETED,
        media_type=media_type,
        filename=filename,
        result=result,
        heatmap_url=f"/api/v1/results/{analysis_id}/heatmap" if include_heatmap else None,
        report_url=f"/api/v1/results/{analysis_id}/report",
        created_at=created_at,
        completed_at=completed_at,
        processing_time_ms=round(processing_time, 1),
    )


@router.post(
    "/image",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
    },
    summary="Analyze a single image",
    description="Upload and analyze an image for deepfake detection.",
)
async def analyze_image(
    request: Request,
    file: UploadFile = File(..., description="Image file to analyze"),
    models: Optional[str] = Form(
        default=None,
        description="Comma-separated list of models to use (e.g., 'efficientnet,xceptionnet')"
    ),
    include_heatmap: bool = Form(default=True, description="Generate heatmap visualization"),
    user: TokenData = Depends(get_current_user),
):
    """Analyze a single image for deepfake detection."""
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    if not validate_file_extension(file.filename, MediaType.IMAGE):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Allowed: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}",
        )
    
    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB",
        )
    
    # Parse models - handle empty strings and whitespace
    model_list = None
    if models and models.strip():
        try:
            model_list = [ModelType(m.strip()) for m in models.split(",") if m.strip()]
            if not model_list:
                model_list = None
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid model: {e}")
    
    # Perform analysis
    return await perform_analysis(
        request=request,
        file_content=content,
        filename=file.filename,
        media_type=MediaType.IMAGE,
        models=model_list,
        include_heatmap=include_heatmap,
    )


@router.post(
    "/video",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
        413: {"model": ErrorResponse},
    },
    summary="Analyze a video",
    description="Upload and analyze a video for deepfake detection.",
)
async def analyze_video(
    request: Request,
    file: UploadFile = File(..., description="Video file to analyze"),
    models: Optional[str] = Form(
        default=None,
        description="Comma-separated list of models to use"
    ),
    frame_sample_rate: int = Form(
        default=10,
        ge=1,
        le=100,
        description="Analyze every Nth frame"
    ),
    include_heatmap: bool = Form(default=True, description="Generate heatmap visualization"),
    user: TokenData = Depends(get_current_user),
):
    """Analyze a video for deepfake detection."""
    # Validate file
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    if not validate_file_extension(file.filename, MediaType.VIDEO):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file format. Allowed: {', '.join(settings.ALLOWED_VIDEO_EXTENSIONS)}",
        )
    
    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE_MB}MB",
        )
    
    # Parse models - handle empty strings and whitespace
    model_list = None
    if models and models.strip():
        try:
            model_list = [ModelType(m.strip()) for m in models.split(",") if m.strip()]
            if not model_list:
                model_list = None
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid model: {e}")
    
    # Perform analysis
    return await perform_analysis(
        request=request,
        file_content=content,
        filename=file.filename,
        media_type=MediaType.VIDEO,
        models=model_list,
        include_heatmap=include_heatmap,
    )


@router.post(
    "/url",
    response_model=AnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
    },
    summary="Analyze content from URL",
    description="Analyze an image or video from a URL.",
)
async def analyze_url(
    request: Request,
    body: AnalyzeURLRequest,
    user: TokenData = Depends(get_current_user),
):
    """Analyze an image or video from a URL."""
    import httpx
    
    # Fetch content from URL
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(str(body.url))
            response.raise_for_status()
            content = response.content
    except httpx.TimeoutException:
        raise HTTPException(status_code=400, detail="Timeout fetching URL")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Error fetching URL: {str(e)}")
    
    # Determine media type from URL
    url_path = str(body.url).lower()
    media_type = get_media_type_from_extension(url_path)
    
    if not media_type:
        # Try to determine from content-type header
        content_type = response.headers.get("content-type", "")
        if "image" in content_type:
            media_type = MediaType.IMAGE
        elif "video" in content_type:
            media_type = MediaType.VIDEO
        else:
            raise HTTPException(
                status_code=400,
                detail="Could not determine media type from URL",
            )
    
    # Perform analysis
    return await perform_analysis(
        request=request,
        file_content=content,
        filename=url_path.split("/")[-1],
        media_type=media_type,
        models=body.models,
        include_heatmap=body.include_heatmap,
    )


@router.post(
    "/batch",
    response_model=BatchAnalysisResponse,
    responses={
        400: {"model": ErrorResponse},
        401: {"model": ErrorResponse},
    },
    summary="Batch analysis",
    description="Submit multiple files or URLs for batch processing.",
)
async def analyze_batch(
    request: Request,
    body: BatchAnalyzeRequest,
    user: TokenData = Depends(require_auth),
):
    """Submit multiple items for batch analysis."""
    batch_id = f"batch_{uuid.uuid4().hex[:12]}"
    created_at = datetime.utcnow()
    
    results = []
    completed_count = 0
    failed_count = 0
    
    # Process URLs if provided
    if body.urls:
        for url in body.urls:
            try:
                url_request = AnalyzeURLRequest(url=url, include_heatmap=True)
                result = await analyze_url(request, url_request, user)
                results.append(result)
                completed_count += 1
            except HTTPException:
                failed_count += 1
    
    return BatchAnalysisResponse(
        batch_id=batch_id,
        total_items=len(body.urls) if body.urls else 0,
        status=AnalysisStatus.COMPLETED if failed_count == 0 else AnalysisStatus.FAILED,
        completed_count=completed_count,
        failed_count=failed_count,
        results=results,
        created_at=created_at,
    )
