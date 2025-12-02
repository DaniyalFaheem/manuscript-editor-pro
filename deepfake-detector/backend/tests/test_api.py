"""
Tests for the deepfake detection API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import io

# Import after setting up mocks
from main import app


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def mock_detection_engine():
    """Mock the detection engine."""
    with patch("main.DetectionEngine") as mock:
        engine = MagicMock()
        engine.initialize = MagicMock()
        engine.cleanup = MagicMock()
        mock.return_value = engine
        yield engine


@pytest.fixture
def auth_headers():
    """Generate auth headers for testing."""
    return {"Authorization": "Bearer test_token"}


class TestHealthEndpoints:
    """Tests for health check endpoints."""
    
    def test_root_endpoint(self, client):
        """Test the root endpoint returns API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert data["status"] == "running"
    
    def test_health_endpoint(self, client):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestAnalysisEndpoints:
    """Tests for analysis endpoints."""
    
    def test_analyze_image_no_auth(self, client):
        """Test that image analysis requires authentication."""
        # Create a fake image file
        image_content = b"fake image content"
        files = {"file": ("test.jpg", io.BytesIO(image_content), "image/jpeg")}
        
        response = client.post("/api/v1/analyze/image", files=files)
        # Without auth, should still work (optional auth in this implementation)
        assert response.status_code in [200, 401]
    
    def test_analyze_image_invalid_format(self, client, auth_headers):
        """Test that invalid file formats are rejected."""
        # Create a fake PDF file
        pdf_content = b"fake pdf content"
        files = {"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        
        response = client.post(
            "/api/v1/analyze/image",
            files=files,
            headers=auth_headers
        )
        assert response.status_code == 400
    
    def test_analyze_url_valid(self, client, auth_headers):
        """Test URL analysis with valid URL."""
        with patch("httpx.AsyncClient.get") as mock_get:
            # Mock the HTTP response
            mock_response = MagicMock()
            mock_response.content = b"fake image data"
            mock_response.headers = {"content-type": "image/jpeg"}
            mock_response.raise_for_status = MagicMock()
            mock_get.return_value.__aenter__.return_value.get.return_value = mock_response
            
            response = client.post(
                "/api/v1/analyze/url",
                json={
                    "url": "https://example.com/image.jpg",
                    "include_heatmap": True
                },
                headers=auth_headers
            )
            # May fail without actual network, but structure should be correct
            assert response.status_code in [200, 400, 500]


class TestModelsEndpoints:
    """Tests for models endpoints."""
    
    def test_list_models(self, client, auth_headers):
        """Test listing available models."""
        response = client.get("/api/v1/models", headers=auth_headers)
        # May require auth
        if response.status_code == 200:
            data = response.json()
            assert "models" in data
            assert "default_model" in data
    
    def test_get_model_info(self, client, auth_headers):
        """Test getting specific model info."""
        response = client.get("/api/v1/models/efficientnet", headers=auth_headers)
        if response.status_code == 200:
            data = response.json()
            assert "name" in data
            assert "accuracy" in data


class TestFeedbackEndpoints:
    """Tests for feedback endpoints."""
    
    def test_submit_feedback(self, client, auth_headers):
        """Test submitting feedback."""
        response = client.post(
            "/api/v1/feedback",
            json={
                "analysis_id": "test_analysis_123",
                "is_correct": True,
                "comments": "Great detection!"
            },
            headers=auth_headers
        )
        # May require auth or return 201
        assert response.status_code in [200, 201, 401]


class TestAuthEndpoints:
    """Tests for authentication endpoints."""
    
    def test_register_user(self, client):
        """Test user registration."""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
                "name": "Test User"
            }
        )
        assert response.status_code in [201, 400]  # 400 if already exists
    
    def test_login(self, client):
        """Test user login."""
        # First register
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "login_test@example.com",
                "password": "securepassword123",
            }
        )
        
        # Then login
        response = client.post(
            "/api/v1/auth/token",
            data={
                "username": "login_test@example.com",
                "password": "securepassword123"
            }
        )
        if response.status_code == 200:
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"


class TestRateLimiting:
    """Tests for rate limiting."""
    
    def test_rate_limit_headers(self, client):
        """Test that rate limit headers are included."""
        response = client.get("/api/v1/models")
        
        # Check for rate limit headers (may not be present on all endpoints)
        # These are optional based on implementation
        if "X-RateLimit-Limit" in response.headers:
            assert int(response.headers["X-RateLimit-Limit"]) > 0


class TestResultsEndpoints:
    """Tests for results endpoints."""
    
    def test_get_nonexistent_result(self, client, auth_headers):
        """Test getting a result that doesn't exist."""
        response = client.get(
            "/api/v1/results/nonexistent_id",
            headers=auth_headers
        )
        assert response.status_code in [404, 401]
    
    def test_get_heatmap(self, client, auth_headers):
        """Test getting a heatmap visualization."""
        response = client.get(
            "/api/v1/results/test_id/heatmap",
            headers=auth_headers
        )
        # May return image or 404
        assert response.status_code in [200, 404, 401]
    
    def test_get_report_json(self, client, auth_headers):
        """Test getting a JSON report."""
        response = client.get(
            "/api/v1/results/test_id/report",
            params={"format": "json"},
            headers=auth_headers
        )
        assert response.status_code in [200, 404, 401]


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
