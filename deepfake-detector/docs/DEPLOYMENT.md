# Deployment Guide

This guide covers deploying the Deepfake Detection System in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start with Docker](#quick-start-with-docker)
3. [Production Deployment](#production-deployment)
4. [Cloud Deployments](#cloud-deployments)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Configuration](#configuration)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

**Minimum:**
- 4 CPU cores
- 8 GB RAM
- 50 GB storage
- Docker 20.10+

**Recommended (for GPU acceleration):**
- 8+ CPU cores
- 16+ GB RAM
- NVIDIA GPU with 8+ GB VRAM
- 100+ GB SSD storage
- CUDA 11.8+

### Software Requirements

- Docker and Docker Compose
- Python 3.10+ (for local development)
- Node.js 18+ (for frontend development)
- PostgreSQL 15+ (or Docker)
- Redis 7+ (or Docker)

## Quick Start with Docker

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/DaniyalFaheem/manuscript-editor-pro.git
cd manuscript-editor-pro/deepfake-detector

# Create environment file
cp .env.example .env
# Edit .env with your settings

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Stopping Services

```bash
docker-compose down

# To remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Production Deployment

### 1. Environment Configuration

Create a production `.env` file:

```bash
# Security - CHANGE THESE!
SECRET_KEY=your-super-secret-key-at-least-32-chars
DATABASE_URL=postgresql+asyncpg://user:password@db:5432/deepfake_db

# Redis
REDIS_URL=redis://:password@redis:6379/0

# Application
DEBUG=false
WORKERS=4

# File uploads
MAX_FILE_SIZE_MB=100
UPLOAD_DIR=/app/uploads

# Model paths
MODEL_PATH=/app/models/weights

# Rate limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# CORS (add your domains)
CORS_ORIGINS=["https://your-domain.com"]

# AWS (optional, for S3 storage)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
```

### 2. SSL/TLS Configuration

For production, use a reverse proxy with SSL. Example Nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # File upload settings
        client_max_body_size 100M;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
        proxy_read_timeout 300;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 3. Database Setup

For production PostgreSQL:

```sql
-- Create database and user
CREATE USER deepfake_user WITH PASSWORD 'secure_password';
CREATE DATABASE deepfake_db OWNER deepfake_user;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE deepfake_db TO deepfake_user;
```

Run migrations:
```bash
docker-compose exec backend alembic upgrade head
```

### 4. Model Weights

Download pre-trained model weights:

```bash
# Create weights directory
mkdir -p models/weights

# Download models (example URLs - replace with actual)
wget -O models/weights/efficientnet_b0_deepfake.pth \
    https://example.com/models/efficientnet_b0_deepfake.pth

wget -O models/weights/xception_deepfake.pth \
    https://example.com/models/xception_deepfake.pth
```

## Cloud Deployments

### AWS Deployment

#### Using ECS (Elastic Container Service)

1. **Create ECR repositories:**
```bash
aws ecr create-repository --repository-name deepfake-backend
aws ecr create-repository --repository-name deepfake-frontend
```

2. **Push images:**
```bash
# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build and push
docker build -f docker/Dockerfile.backend -t deepfake-backend .
docker tag deepfake-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/deepfake-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/deepfake-backend:latest
```

3. **Create ECS cluster and services** using AWS Console or Terraform.

#### Using AWS App Runner

For simpler deployments, use App Runner with a `apprunner.yaml`:

```yaml
version: 1.0
runtime: python311
build:
  commands:
    build:
      - pip install -r requirements.txt
run:
  runtime-version: 3.11
  command: uvicorn main:app --host 0.0.0.0 --port 8000
  network:
    port: 8000
```

### Google Cloud Deployment

Using Cloud Run:

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/deepfake-backend

# Deploy
gcloud run deploy deepfake-backend \
    --image gcr.io/PROJECT_ID/deepfake-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2
```

### Azure Deployment

Using Azure Container Apps:

```bash
# Create container app environment
az containerapp env create \
    --name deepfake-env \
    --resource-group myResourceGroup \
    --location eastus

# Deploy app
az containerapp create \
    --name deepfake-backend \
    --resource-group myResourceGroup \
    --environment deepfake-env \
    --image your-registry.azurecr.io/deepfake-backend:latest \
    --target-port 8000 \
    --ingress external \
    --cpu 2 --memory 4Gi
```

## Kubernetes Deployment

### Basic Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: deepfake-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: deepfake-backend
  template:
    metadata:
      labels:
        app: deepfake-backend
    spec:
      containers:
      - name: backend
        image: your-registry/deepfake-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: deepfake-secrets
              key: database-url
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "4Gi"
            cpu: "2"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: deepfake-backend
spec:
  selector:
    app: deepfake-backend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

### GPU Support (for faster inference)

```yaml
spec:
  containers:
  - name: backend
    resources:
      limits:
        nvidia.com/gpu: 1
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | JWT signing key | Required |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `DEBUG` | Enable debug mode | `false` |
| `WORKERS` | Number of Uvicorn workers | `4` |
| `MAX_FILE_SIZE_MB` | Maximum upload size | `100` |
| `MODEL_PATH` | Path to model weights | `./models/weights` |
| `CORS_ORIGINS` | Allowed origins | `["*"]` |

### Scaling Considerations

- **Horizontal scaling:** Add more backend replicas behind a load balancer
- **GPU acceleration:** Use NVIDIA GPUs for faster inference
- **Caching:** Redis caches frequently accessed results
- **CDN:** Use CloudFront/Cloudflare for static assets

## Monitoring

### Health Checks

The API exposes health endpoints:
- `GET /health` - Overall health status
- `GET /` - API info

### Prometheus Metrics

Metrics are exposed at `/metrics` (when enabled):

```bash
# prometheus.yml
scrape_configs:
  - job_name: 'deepfake-api'
    static_configs:
      - targets: ['backend:8000']
```

### Logging

Logs are structured JSON:
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "message": "Analysis completed",
  "analysis_id": "abc123",
  "duration_ms": 1523
}
```

## Troubleshooting

### Common Issues

**1. Models not loading:**
```bash
# Check if weights exist
docker-compose exec backend ls -la /app/models/weights

# Check logs
docker-compose logs backend | grep -i model
```

**2. Database connection failed:**
```bash
# Test connection
docker-compose exec backend python -c "from config import settings; print(settings.DATABASE_URL)"

# Check PostgreSQL is running
docker-compose ps db
```

**3. Out of memory:**
- Increase container memory limits
- Reduce batch sizes
- Use GPU acceleration

**4. Slow inference:**
- Enable GPU support
- Reduce image/video resolution
- Use fewer models in ensemble

### Getting Help

- Check logs: `docker-compose logs -f`
- Open an issue: https://github.com/DaniyalFaheem/manuscript-editor-pro/issues
- Documentation: See API.md and USER_GUIDE.md
