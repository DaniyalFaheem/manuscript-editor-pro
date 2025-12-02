"""
Application Settings and Configuration
Uses Pydantic Settings for environment variable management.
"""

from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    APP_NAME: str = "Deepfake Detection API"
    DEBUG: bool = Field(default=False)
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    WORKERS: int = Field(default=4)
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    API_KEY_HEADER: str = Field(default="X-API-Key")
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/deepfake_db"
    )
    
    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    
    # File Storage
    UPLOAD_DIR: str = Field(default="./uploads")
    MAX_FILE_SIZE_MB: int = Field(default=100)
    ALLOWED_IMAGE_EXTENSIONS: List[str] = Field(
        default=["jpg", "jpeg", "png", "webp", "bmp", "gif"]
    )
    ALLOWED_VIDEO_EXTENSIONS: List[str] = Field(
        default=["mp4", "avi", "mov", "mkv", "webm", "flv"]
    )
    
    # Model Configuration
    MODEL_PATH: str = Field(default="./models/weights")
    EFFICIENTNET_MODEL: str = Field(default="efficientnet_b0_deepfake.pth")
    XCEPTION_MODEL: str = Field(default="xception_deepfake.pth")
    ENSEMBLE_THRESHOLD: float = Field(default=0.5)
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60)
    RATE_LIMIT_PER_HOUR: int = Field(default=1000)
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "*"]
    )
    
    # AWS (Optional - for S3 storage)
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None)
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None)
    AWS_REGION: str = Field(default="us-east-1")
    S3_BUCKET: Optional[str] = Field(default=None)
    
    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/1")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/2")
    
    # Analysis Settings
    VIDEO_FRAME_SAMPLE_RATE: int = Field(default=10)  # Analyze every Nth frame
    MIN_FACE_SIZE: int = Field(default=64)  # Minimum face size in pixels
    CONFIDENCE_THRESHOLD: float = Field(default=0.7)
    HEATMAP_RESOLUTION: int = Field(default=224)
    
    # Cleanup
    AUTO_DELETE_AFTER_HOURS: int = Field(default=24)
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()
