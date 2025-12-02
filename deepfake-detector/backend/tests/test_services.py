"""
Tests for the detection engine and related services.
"""

import pytest
import numpy as np
from unittest.mock import patch, MagicMock, AsyncMock
import io
from PIL import Image


class TestDetectionEngine:
    """Tests for the DetectionEngine class."""
    
    @pytest.fixture
    def sample_image_bytes(self):
        """Create a sample image for testing."""
        img = Image.new('RGB', (224, 224), color='red')
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        return buffer.getvalue()
    
    @pytest.fixture
    def sample_image_array(self):
        """Create a sample image array for testing."""
        return np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
    
    @pytest.mark.asyncio
    async def test_detection_engine_initialization(self):
        """Test that detection engine initializes correctly."""
        from services.detection_engine import DetectionEngine
        
        engine = DetectionEngine()
        await engine.initialize()
        
        assert engine.is_initialized
        assert len(engine.detectors) > 0
        assert engine.ensemble is not None
        
        await engine.cleanup()
        assert not engine.is_initialized
    
    @pytest.mark.asyncio
    async def test_analyze_image(self, sample_image_bytes):
        """Test image analysis."""
        from services.detection_engine import DetectionEngine
        
        engine = DetectionEngine()
        await engine.initialize()
        
        result = await engine.analyze_image(sample_image_bytes)
        
        assert "overall_confidence" in result
        assert "is_deepfake" in result
        assert "model_results" in result
        assert 0 <= result["overall_confidence"] <= 1
        
        await engine.cleanup()
    
    @pytest.mark.asyncio
    async def test_efficientnet_detector(self, sample_image_array):
        """Test EfficientNet detector."""
        from services.detection_engine import EfficientNetDetector
        
        detector = EfficientNetDetector()
        await detector.load()
        
        assert detector.is_loaded
        
        confidence, info = await detector.predict(sample_image_array)
        
        assert 0 <= confidence <= 1
        assert "model" in info
        assert info["model"] == "EfficientNet-B0"
    
    @pytest.mark.asyncio
    async def test_xceptionnet_detector(self, sample_image_array):
        """Test XceptionNet detector."""
        from services.detection_engine import XceptionNetDetector
        
        detector = XceptionNetDetector()
        await detector.load()
        
        assert detector.is_loaded
        
        confidence, info = await detector.predict(sample_image_array)
        
        assert 0 <= confidence <= 1
        assert "model" in info
    
    @pytest.mark.asyncio
    async def test_ensemble_detector(self, sample_image_array):
        """Test ensemble detector."""
        from services.detection_engine import (
            EnsembleDetector, 
            EfficientNetDetector, 
            XceptionNetDetector,
            ResNetDetector
        )
        
        detectors = [
            EfficientNetDetector(),
            XceptionNetDetector(),
            ResNetDetector(),
        ]
        
        for detector in detectors:
            await detector.load()
        
        ensemble = EnsembleDetector(detectors)
        confidence, info = await ensemble.predict(sample_image_array)
        
        assert 0 <= confidence <= 1
        assert info["ensemble"] is True
        assert "individual_results" in info


class TestImageProcessor:
    """Tests for the ImageProcessor class."""
    
    @pytest.fixture
    def sample_image_bytes(self):
        """Create a sample image for testing."""
        img = Image.new('RGB', (500, 500), color='blue')
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        return buffer.getvalue()
    
    def test_load_image(self, sample_image_bytes):
        """Test loading an image from bytes."""
        from services.image_processor import ImageProcessor
        
        processor = ImageProcessor()
        image = processor.load_image(sample_image_bytes)
        
        assert image is not None
        assert image.size == (500, 500)
    
    def test_preprocess(self, sample_image_bytes):
        """Test image preprocessing."""
        from services.image_processor import ImageProcessor
        
        processor = ImageProcessor()
        image = processor.load_image(sample_image_bytes)
        preprocessed = processor.preprocess(image)
        
        assert preprocessed.shape == (224, 224, 3)
        # Check normalization was applied
        assert preprocessed.min() < 0 or preprocessed.max() > 1
    
    def test_extract_metadata(self):
        """Test metadata extraction."""
        from services.image_processor import ImageProcessor
        
        # Create image with EXIF data
        img = Image.new('RGB', (100, 100), color='green')
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        image_bytes = buffer.getvalue()
        
        processor = ImageProcessor()
        metadata = processor.extract_metadata(image_bytes)
        
        assert "camera_make" in metadata
        assert "software" in metadata
        assert "warnings" in metadata
    
    def test_detect_faces(self):
        """Test face detection."""
        from services.image_processor import ImageProcessor
        
        processor = ImageProcessor()
        image_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
        faces = processor.detect_faces(image_array)
        
        # Should return list of face regions
        assert isinstance(faces, list)
        if len(faces) > 0:
            assert "x" in faces[0]
            assert "y" in faces[0]
            assert "width" in faces[0]
            assert "height" in faces[0]
    
    def test_analyze_texture(self):
        """Test texture analysis."""
        from services.image_processor import ImageProcessor
        
        processor = ImageProcessor()
        image_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
        result = processor.analyze_texture(image_array)
        
        assert "mean_intensity" in result
        assert "std_intensity" in result
        assert "texture_score" in result
    
    def test_analyze_frequency_domain(self):
        """Test frequency domain analysis."""
        from services.image_processor import ImageProcessor
        
        processor = ImageProcessor()
        image_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        
        result = processor.analyze_frequency_domain(image_array)
        
        assert "high_freq_energy" in result
        assert "spectrum_uniformity" in result


class TestVideoProcessor:
    """Tests for the VideoProcessor class."""
    
    def test_get_video_info(self):
        """Test getting video information."""
        from services.video_processor import VideoProcessor
        
        processor = VideoProcessor()
        # Mock video data
        video_data = b"fake video data"
        
        info = processor.get_video_info(video_data)
        
        assert "duration_seconds" in info
        assert "fps" in info
        assert "frame_count" in info
    
    def test_analyze_temporal_consistency(self):
        """Test temporal consistency analysis."""
        from services.video_processor import VideoProcessor
        
        processor = VideoProcessor()
        
        # Test with consistent predictions
        predictions = [0.8, 0.82, 0.79, 0.81, 0.8]
        result = processor.analyze_temporal_consistency(predictions)
        
        assert "consistency_score" in result
        assert "is_temporally_consistent" in result
        
        # Test with inconsistent predictions
        predictions = [0.2, 0.9, 0.3, 0.85, 0.1]
        result = processor.analyze_temporal_consistency(predictions)
        
        assert result["consistency_score"] < 0.5 or len(result["potential_splice_points"]) > 0
    
    def test_detect_blink_patterns(self):
        """Test blink pattern detection."""
        from services.video_processor import VideoProcessor
        
        processor = VideoProcessor()
        
        # Mock face regions for 100 frames
        face_regions = [{"x": 100, "y": 80} for _ in range(100)]
        frame_indices = list(range(100))
        
        result = processor.detect_blink_patterns(face_regions, frame_indices, fps=30.0)
        
        assert "blink_rate_per_minute" in result
        assert "is_normal_rate" in result


class TestMetadataAnalyzer:
    """Tests for the MetadataAnalyzer class."""
    
    @pytest.fixture
    def sample_image_bytes(self):
        """Create a sample image for testing."""
        img = Image.new('RGB', (100, 100), color='white')
        buffer = io.BytesIO()
        img.save(buffer, format='JPEG')
        return buffer.getvalue()
    
    def test_analyze_image_metadata(self, sample_image_bytes):
        """Test image metadata analysis."""
        from services.metadata_analyzer import MetadataAnalyzer
        
        analyzer = MetadataAnalyzer()
        result = analyzer.analyze_image_metadata(sample_image_bytes)
        
        assert "exif" in result
        assert "file_info" in result
        assert "warnings" in result
        assert "trust_score" in result
    
    def test_verify_image_integrity(self, sample_image_bytes):
        """Test image integrity verification."""
        from services.metadata_analyzer import MetadataAnalyzer
        
        analyzer = MetadataAnalyzer()
        result = analyzer.verify_image_integrity(sample_image_bytes)
        
        assert "is_valid" in result
        assert "format_valid" in result
        assert result["is_valid"] is True
    
    def test_verify_corrupted_image(self):
        """Test verification of corrupted image."""
        from services.metadata_analyzer import MetadataAnalyzer
        
        analyzer = MetadataAnalyzer()
        result = analyzer.verify_image_integrity(b"not an image")
        
        assert result["is_valid"] is False


class TestReportGenerator:
    """Tests for the ReportGenerator class."""
    
    @pytest.fixture
    def sample_result(self):
        """Create a sample analysis result."""
        return {
            "is_deepfake": True,
            "confidence": 0.87,
            "models": {
                "efficientnet": {"score": 0.89, "prediction": "fake"},
                "xceptionnet": {"score": 0.85, "prediction": "fake"},
            },
            "analysis": {
                "facial_landmarks": {
                    "anomaly_detected": True,
                    "landmark_count": 68,
                    "symmetry_score": 0.78
                }
            }
        }
    
    def test_generate_json_report(self, sample_result):
        """Test JSON report generation."""
        from services.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        report = generator.generate_json_report("test_id", sample_result)
        
        import json
        parsed = json.loads(report)
        
        assert "report_metadata" in parsed
        assert "summary" in parsed
        assert parsed["summary"]["is_deepfake"] is True
    
    def test_generate_pdf_report(self, sample_result):
        """Test PDF report generation."""
        from services.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        pdf_bytes = generator.generate_pdf_report("test_id", sample_result)
        
        # Check that it starts with PDF magic bytes
        assert pdf_bytes[:4] == b'%PDF'


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
