# Deepfake Detection API Documentation

## Overview

The Deepfake Detection API provides comprehensive endpoints for analyzing images and videos for manipulation, synthetic content, and AI-generated media.

**Base URL:** `http://localhost:8000/api/v1`

**API Version:** 1.0.0

## Authentication

All API endpoints (except health checks) require authentication using JWT tokens or API keys.

### JWT Authentication

1. Obtain a token by calling `/auth/token` with your credentials
2. Include the token in the `Authorization` header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

### API Key Authentication

1. Generate an API key via `/auth/api-keys`
2. Include the key in the `X-API-Key` header:
   ```
   X-API-Key: df_your_api_key_here
   ```

## Rate Limiting

- **Default:** 60 requests per minute per user/API key
- **Image analysis:** 2 tokens per request
- **Video analysis:** 5 tokens per request
- **Batch analysis:** 10 tokens per request

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Get Access Token
```http
POST /auth/token
Content-Type: application/x-www-form-urlencoded
```

**Request Body:**
```
username=user@example.com&password=securepassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### Create API Key
```http
POST /auth/api-keys
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Application",
  "scopes": ["analyze", "results"]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "My Application",
  "key": "df_abc123xyz...",
  "scopes": ["analyze", "results"],
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Analysis

#### Analyze Image
```http
POST /analyze/image
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request:**
- `file` (required): Image file (JPEG, PNG, WEBP, BMP, GIF)
- `models` (optional): Comma-separated list of models (e.g., "efficientnet,xceptionnet")
- `include_heatmap` (optional): Boolean, default true

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze/image" \
  -H "Authorization: Bearer <token>" \
  -F "file=@image.jpg" \
  -F "include_heatmap=true"
```

**Response:**
```json
{
  "id": "analysis_abc123",
  "status": "completed",
  "media_type": "image",
  "filename": "image.jpg",
  "result": {
    "is_deepfake": true,
    "confidence": 0.87,
    "prediction": "fake",
    "models": {
      "efficientnet": {
        "score": 0.89,
        "prediction": "fake",
        "processing_time_ms": 145
      },
      "xceptionnet": {
        "score": 0.85,
        "prediction": "fake",
        "processing_time_ms": 167
      }
    },
    "analysis": {
      "facial_landmarks": {
        "anomaly_detected": true,
        "landmark_count": 68,
        "symmetry_score": 0.78
      },
      "texture_analysis": {
        "skin_texture_score": 0.72,
        "lighting_consistency": 0.65,
        "noise_pattern_anomaly": true
      }
    }
  },
  "heatmap_url": "/api/v1/results/analysis_abc123/heatmap",
  "report_url": "/api/v1/results/analysis_abc123/report",
  "created_at": "2024-01-15T10:30:00Z",
  "completed_at": "2024-01-15T10:30:02Z",
  "processing_time_ms": 2145
}
```

#### Analyze Video
```http
POST /analyze/video
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request:**
- `file` (required): Video file (MP4, AVI, MOV, MKV, WEBM)
- `models` (optional): Comma-separated list of models
- `frame_sample_rate` (optional): Analyze every Nth frame, default 10
- `include_heatmap` (optional): Boolean, default true

**Response:** Same structure as image analysis with additional temporal analysis.

#### Analyze from URL
```http
POST /analyze/url
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "url": "https://example.com/image.jpg",
  "models": ["efficientnet", "xceptionnet"],
  "include_heatmap": true
}
```

#### Batch Analysis
```http
POST /analyze/batch
Content-Type: application/json
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "webhook_url": "https://myapp.com/webhook"
}
```

**Response:**
```json
{
  "batch_id": "batch_xyz789",
  "total_items": 2,
  "status": "processing",
  "completed_count": 0,
  "failed_count": 0,
  "results": [],
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_completion": "2024-01-15T10:30:30Z"
}
```

---

### Results

#### Get Analysis Result
```http
GET /results/{analysis_id}
Authorization: Bearer <token>
```

**Response:** Full analysis result object (same as analysis response).

#### Get Heatmap
```http
GET /results/{analysis_id}/heatmap
Authorization: Bearer <token>
```

**Query Parameters:**
- `format`: Image format (png, jpg, webp), default "png"
- `resolution`: Image resolution (64-1024), default 224

**Response:** Image file (Content-Type: image/png)

#### Download Report
```http
GET /results/{analysis_id}/report
Authorization: Bearer <token>
```

**Query Parameters:**
- `format`: Report format (json, pdf), default "json"

**Response:** File download

#### Get Frame Analysis (Video)
```http
GET /results/{analysis_id}/frames
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_frame`: Starting frame index, default 0
- `end_frame`: Ending frame index (optional)

**Response:**
```json
{
  "analysis_id": "analysis_abc123",
  "total_frames": 300,
  "analyzed_frames": 30,
  "frames": [
    {
      "frame_number": 0,
      "timestamp_ms": 0,
      "is_deepfake": true,
      "confidence": 0.85,
      "face_detected": true,
      "face_region": {
        "x": 100,
        "y": 80,
        "width": 150,
        "height": 180
      }
    }
  ]
}
```

---

### Models

#### List Available Models
```http
GET /models
Authorization: Bearer <token>
```

**Response:**
```json
{
  "models": [
    {
      "name": "EfficientNet-B0 Deepfake Classifier",
      "type": "efficientnet",
      "version": "1.2.0",
      "description": "EfficientNet-B0 based classifier...",
      "accuracy": 0.942,
      "f1_score": 0.930,
      "is_loaded": true,
      "supported_media": ["image", "video"]
    }
  ],
  "default_model": "ensemble",
  "ensemble_enabled": true
}
```

#### Get Model Info
```http
GET /models/{model_name}
Authorization: Bearer <token>
```

#### Get Model Performance
```http
GET /models/{model_name}/performance
Authorization: Bearer <token>
```

---

### Feedback

#### Submit Feedback
```http
POST /feedback
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "analysis_id": "analysis_abc123",
  "is_correct": false,
  "actual_label": "real",
  "comments": "This was a genuine photo from my camera"
}
```

**Response:**
```json
{
  "id": "feedback_xyz",
  "analysis_id": "analysis_abc123",
  "status": "received",
  "message": "Thank you for your feedback!"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "error_type",
  "message": "Human-readable error message",
  "details": {
    "additional": "context"
  }
}
```

### Common Error Codes

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | validation_error | Invalid request data |
| 401 | unauthorized | Missing or invalid authentication |
| 403 | forbidden | Insufficient permissions |
| 404 | not_found | Resource not found |
| 413 | file_too_large | File exceeds size limit |
| 429 | rate_limit_exceeded | Too many requests |
| 500 | internal_error | Server error |

---

## Webhooks

When using batch analysis with a webhook URL, we'll send a POST request upon completion:

```json
{
  "event": "batch_completed",
  "batch_id": "batch_xyz789",
  "completed_at": "2024-01-15T10:30:30Z",
  "summary": {
    "total": 10,
    "completed": 9,
    "failed": 1,
    "deepfakes_detected": 3
  },
  "results_url": "http://localhost:8000/api/v1/results/batch/batch_xyz789"
}
```

---

## SDKs and Libraries

### Python
```python
from deepfake_detector import Client

client = Client(api_key="df_your_api_key")
result = client.analyze_image("path/to/image.jpg")
print(f"Deepfake: {result.is_deepfake}, Confidence: {result.confidence}")
```

### JavaScript/TypeScript
```javascript
import { DeepfakeDetector } from 'deepfake-detector-client';

const client = new DeepfakeDetector({ apiKey: 'df_your_api_key' });
const result = await client.analyzeImage(file);
console.log(`Deepfake: ${result.is_deepfake}, Confidence: ${result.confidence}`);
```

---

## Best Practices

1. **Use appropriate models**: For quick checks, use a single model. For high-stakes decisions, use the ensemble.

2. **Handle rate limits gracefully**: Implement exponential backoff when you receive 429 responses.

3. **Cache results**: Store analysis results by their ID to avoid re-analyzing the same content.

4. **Provide feedback**: Help improve our models by submitting feedback on incorrect predictions.

5. **Use webhooks for batch processing**: Instead of polling, register a webhook URL for batch jobs.

---

## Support

- **Documentation**: https://docs.deepfake-detector.example.com
- **API Status**: https://status.deepfake-detector.example.com
- **Support Email**: support@deepfake-detector.example.com
- **GitHub Issues**: https://github.com/DaniyalFaheem/manuscript-editor-pro/issues
