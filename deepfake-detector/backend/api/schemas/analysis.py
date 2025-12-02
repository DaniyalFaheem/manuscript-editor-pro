"""
Pydantic schemas for API request/response validation.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, HttpUrl


class AnalysisStatus(str, Enum):
    """Status of an analysis job."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Prediction(str, Enum):
    """Prediction result."""
    REAL = "real"
    FAKE = "fake"
    UNCERTAIN = "uncertain"


class MediaType(str, Enum):
    """Type of media being analyzed."""
    IMAGE = "image"
    VIDEO = "video"


class ModelType(str, Enum):
    """Available detection models."""
    EFFICIENTNET = "efficientnet"
    XCEPTIONNET = "xceptionnet"
    RESNET = "resnet"
    ENSEMBLE = "ensemble"


# Request Schemas

class AnalyzeURLRequest(BaseModel):
    """Request to analyze content from a URL."""
    url: HttpUrl = Field(..., description="URL of the image or video to analyze")
    models: Optional[List[ModelType]] = Field(
        default=None,
        description="Specific models to use (defaults to all)"
    )
    include_heatmap: bool = Field(
        default=True,
        description="Whether to generate a heatmap"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com/image.jpg",
                "models": ["efficientnet", "xceptionnet"],
                "include_heatmap": True
            }
        }


class BatchAnalyzeRequest(BaseModel):
    """Request for batch analysis."""
    urls: Optional[List[HttpUrl]] = Field(
        default=None,
        description="List of URLs to analyze"
    )
    webhook_url: Optional[HttpUrl] = Field(
        default=None,
        description="Webhook URL to notify when batch is complete"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "urls": [
                    "https://example.com/image1.jpg",
                    "https://example.com/image2.jpg"
                ],
                "webhook_url": "https://myapp.com/webhook"
            }
        }


class FeedbackRequest(BaseModel):
    """Request to submit feedback on an analysis."""
    analysis_id: str = Field(..., description="ID of the analysis")
    is_correct: bool = Field(..., description="Whether the prediction was correct")
    actual_label: Optional[Prediction] = Field(
        default=None,
        description="The actual label if prediction was wrong"
    )
    comments: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Additional comments"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "analysis_id": "analysis_123456",
                "is_correct": False,
                "actual_label": "real",
                "comments": "This was a real image from my camera"
            }
        }


# Response Schemas

class ModelScore(BaseModel):
    """Score from a single model."""
    score: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    prediction: Prediction = Field(..., description="Model prediction")
    processing_time_ms: float = Field(..., description="Processing time in milliseconds")


class FacialLandmarkAnalysis(BaseModel):
    """Results from facial landmark analysis."""
    anomaly_detected: bool = Field(..., description="Whether anomalies were detected")
    regions: List[Dict[str, Any]] = Field(
        default=[],
        description="List of anomalous regions"
    )
    landmark_count: int = Field(..., description="Number of landmarks detected")
    symmetry_score: float = Field(..., ge=0, le=1, description="Facial symmetry score")


class TextureAnalysis(BaseModel):
    """Results from texture analysis."""
    inconsistencies: List[Dict[str, Any]] = Field(
        default=[],
        description="List of texture inconsistencies found"
    )
    skin_texture_score: float = Field(..., ge=0, le=1)
    lighting_consistency: float = Field(..., ge=0, le=1)
    noise_pattern_anomaly: bool = Field(default=False)


class MetadataAnalysis(BaseModel):
    """Results from metadata analysis."""
    camera_make: Optional[str] = None
    camera_model: Optional[str] = None
    software: Optional[str] = None
    datetime_original: Optional[str] = None
    gps_info: Optional[Dict[str, Any]] = None
    suspicious_metadata: bool = Field(default=False)
    warnings: List[str] = Field(default=[])


class TemporalAnalysis(BaseModel):
    """Results from temporal analysis (videos only)."""
    frame_count: int = Field(..., description="Total number of frames analyzed")
    inconsistent_frames: List[int] = Field(
        default=[],
        description="Indices of inconsistent frames"
    )
    blink_anomaly_detected: bool = Field(default=False)
    optical_flow_score: float = Field(..., ge=0, le=1)
    audio_sync_score: Optional[float] = Field(default=None)


class DetailedAnalysis(BaseModel):
    """Detailed analysis results."""
    facial_landmarks: Optional[FacialLandmarkAnalysis] = None
    texture_analysis: Optional[TextureAnalysis] = None
    metadata: Optional[MetadataAnalysis] = None
    temporal_analysis: Optional[TemporalAnalysis] = None
    frequency_domain: Optional[Dict[str, Any]] = None


class AnalysisResult(BaseModel):
    """Complete analysis result."""
    is_deepfake: bool = Field(..., description="Whether the content is detected as deepfake")
    confidence: float = Field(..., ge=0, le=1, description="Overall confidence score")
    prediction: Prediction = Field(..., description="Final prediction")
    models: Dict[str, ModelScore] = Field(..., description="Results from each model")
    analysis: DetailedAnalysis = Field(..., description="Detailed analysis breakdown")


class AnalysisResponse(BaseModel):
    """Response from analysis endpoints."""
    id: str = Field(..., description="Unique analysis ID")
    status: AnalysisStatus = Field(..., description="Current status")
    media_type: MediaType = Field(..., description="Type of media analyzed")
    filename: Optional[str] = Field(default=None, description="Original filename")
    result: Optional[AnalysisResult] = Field(
        default=None,
        description="Analysis result (null if still processing)"
    )
    heatmap_url: Optional[str] = Field(
        default=None,
        description="URL to access the heatmap visualization"
    )
    report_url: Optional[str] = Field(
        default=None,
        description="URL to download the full report"
    )
    created_at: datetime = Field(..., description="When the analysis was started")
    completed_at: Optional[datetime] = Field(
        default=None,
        description="When the analysis was completed"
    )
    processing_time_ms: Optional[float] = Field(
        default=None,
        description="Total processing time in milliseconds"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "analysis_123456",
                "status": "completed",
                "media_type": "image",
                "filename": "test_image.jpg",
                "result": {
                    "is_deepfake": True,
                    "confidence": 0.89,
                    "prediction": "fake",
                    "models": {
                        "efficientnet": {
                            "score": 0.92,
                            "prediction": "fake",
                            "processing_time_ms": 150
                        }
                    },
                    "analysis": {}
                },
                "heatmap_url": "/api/v1/results/analysis_123456/heatmap",
                "created_at": "2024-01-15T10:30:00Z",
                "completed_at": "2024-01-15T10:30:05Z",
                "processing_time_ms": 5000
            }
        }


class BatchAnalysisResponse(BaseModel):
    """Response from batch analysis."""
    batch_id: str = Field(..., description="Unique batch ID")
    total_items: int = Field(..., description="Total number of items in batch")
    status: AnalysisStatus = Field(..., description="Overall batch status")
    completed_count: int = Field(default=0, description="Number of completed analyses")
    failed_count: int = Field(default=0, description="Number of failed analyses")
    results: List[AnalysisResponse] = Field(
        default=[],
        description="Individual analysis results"
    )
    created_at: datetime = Field(...)
    estimated_completion: Optional[datetime] = Field(default=None)


class ModelInfo(BaseModel):
    """Information about a detection model."""
    name: str = Field(..., description="Model name")
    type: ModelType = Field(..., description="Model type")
    version: str = Field(..., description="Model version")
    description: str = Field(..., description="Model description")
    accuracy: float = Field(..., ge=0, le=1, description="Model accuracy on test set")
    f1_score: float = Field(..., ge=0, le=1, description="F1 score")
    is_loaded: bool = Field(..., description="Whether model is currently loaded")
    supported_media: List[MediaType] = Field(..., description="Supported media types")


class ModelsListResponse(BaseModel):
    """Response listing available models."""
    models: List[ModelInfo] = Field(..., description="List of available models")
    default_model: str = Field(..., description="Default model used")
    ensemble_enabled: bool = Field(..., description="Whether ensemble is enabled")


class FeedbackResponse(BaseModel):
    """Response after submitting feedback."""
    id: str = Field(..., description="Feedback ID")
    analysis_id: str = Field(..., description="Related analysis ID")
    status: str = Field(default="received", description="Feedback status")
    message: str = Field(default="Thank you for your feedback!")


# Auth Schemas

class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    """Token payload data."""
    sub: str
    exp: datetime
    api_key: Optional[str] = None
    scopes: List[str] = []


class UserCreate(BaseModel):
    """User registration request."""
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=8, max_length=100)
    name: Optional[str] = Field(default=None, max_length=100)


class UserResponse(BaseModel):
    """User response."""
    id: str
    email: str
    name: Optional[str] = None
    api_key: Optional[str] = None
    created_at: datetime
    is_active: bool = True


class APIKeyCreate(BaseModel):
    """Request to create an API key."""
    name: str = Field(..., max_length=100, description="Name for the API key")
    scopes: List[str] = Field(default=["analyze"], description="Permissions for this key")


class APIKeyResponse(BaseModel):
    """API key response."""
    id: str
    name: str
    key: str  # Only shown once at creation
    scopes: List[str]
    created_at: datetime
    last_used: Optional[datetime] = None
    is_active: bool = True


# Error Schemas

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional error details"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "error": "validation_error",
                "message": "Invalid file format",
                "details": {
                    "allowed_formats": ["jpg", "png", "mp4"],
                    "received": "pdf"
                }
            }
        }
