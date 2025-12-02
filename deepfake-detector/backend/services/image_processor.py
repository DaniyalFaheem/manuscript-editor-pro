"""
Image Processing Service
Handles image loading, preprocessing, and analysis.
"""

import io
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image
import exifread

from config.settings import settings


class ImageProcessor:
    """Service for processing and analyzing images."""
    
    SUPPORTED_FORMATS = ["JPEG", "PNG", "WEBP", "BMP", "GIF"]
    
    def __init__(self):
        self.target_size = (224, 224)
    
    def load_image(self, image_data: bytes) -> Image.Image:
        """
        Load an image from bytes.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            PIL Image object
        """
        try:
            image = Image.open(io.BytesIO(image_data))
            return image
        except Exception as e:
            raise ValueError(f"Failed to load image: {str(e)}")
    
    def preprocess(
        self,
        image: Image.Image,
        target_size: Optional[Tuple[int, int]] = None,
    ) -> np.ndarray:
        """
        Preprocess image for model input.
        
        Args:
            image: PIL Image object
            target_size: Target size (width, height)
            
        Returns:
            Preprocessed image as numpy array
        """
        size = target_size or self.target_size
        
        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Resize
        image = image.resize(size, Image.Resampling.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize to [0, 1]
        img_array = img_array / 255.0
        
        # Normalize with ImageNet stats
        mean = np.array([0.485, 0.456, 0.406])
        std = np.array([0.229, 0.224, 0.225])
        img_array = (img_array - mean) / std
        
        return img_array
    
    def extract_metadata(self, image_data: bytes) -> Dict[str, Any]:
        """
        Extract EXIF metadata from image.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Dictionary of metadata fields
        """
        metadata = {
            "camera_make": None,
            "camera_model": None,
            "software": None,
            "datetime_original": None,
            "gps_info": None,
            "suspicious": False,
            "warnings": [],
        }
        
        try:
            tags = exifread.process_file(io.BytesIO(image_data))
            
            # Extract common fields
            if "Image Make" in tags:
                metadata["camera_make"] = str(tags["Image Make"])
            
            if "Image Model" in tags:
                metadata["camera_model"] = str(tags["Image Model"])
            
            if "Image Software" in tags:
                software = str(tags["Image Software"])
                metadata["software"] = software
                
                # Check for suspicious software
                suspicious_software = ["photoshop", "gimp", "deepfake", "faceswap"]
                if any(s in software.lower() for s in suspicious_software):
                    metadata["suspicious"] = True
                    metadata["warnings"].append(
                        f"Image was edited with: {software}"
                    )
            
            if "EXIF DateTimeOriginal" in tags:
                metadata["datetime_original"] = str(tags["EXIF DateTimeOriginal"])
            
            # Check for GPS
            gps_tags = ["GPS GPSLatitude", "GPS GPSLongitude"]
            if any(tag in tags for tag in gps_tags):
                metadata["gps_info"] = {
                    "latitude": str(tags.get("GPS GPSLatitude", "")),
                    "longitude": str(tags.get("GPS GPSLongitude", "")),
                }
        
        except Exception as e:
            metadata["warnings"].append(f"Failed to read EXIF: {str(e)}")
        
        return metadata
    
    def detect_faces(
        self,
        image: np.ndarray,
        min_size: int = 64,
    ) -> List[Dict[str, Any]]:
        """
        Detect faces in an image.
        
        Args:
            image: Image as numpy array
            min_size: Minimum face size in pixels
            
        Returns:
            List of detected face regions
        """
        # In production, use face-recognition, dlib, or mediapipe
        # For now, return mock face detection
        
        height, width = image.shape[:2]
        
        # Mock: Return a centered face region
        face_width = min(width // 3, height // 3)
        face_height = int(face_width * 1.2)
        
        faces = [
            {
                "x": (width - face_width) // 2,
                "y": (height - face_height) // 2,
                "width": face_width,
                "height": face_height,
                "confidence": 0.95,
            }
        ]
        
        return faces
    
    def analyze_texture(
        self,
        image: np.ndarray,
        face_region: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze image texture for inconsistencies.
        
        Args:
            image: Image as numpy array
            face_region: Optional face region to analyze
            
        Returns:
            Texture analysis results
        """
        if face_region:
            x, y = face_region["x"], face_region["y"]
            w, h = face_region["width"], face_region["height"]
            region = image[y:y+h, x:x+w]
        else:
            region = image
        
        # Calculate texture statistics
        mean_intensity = np.mean(region)
        std_intensity = np.std(region)
        
        # Analyze color channels
        if len(region.shape) == 3:
            r_std = np.std(region[:, :, 0])
            g_std = np.std(region[:, :, 1])
            b_std = np.std(region[:, :, 2])
            color_variance = np.std([r_std, g_std, b_std])
        else:
            color_variance = 0
        
        # Calculate local contrast
        from scipy import ndimage
        if len(region.shape) == 3:
            gray = np.mean(region, axis=2)
        else:
            gray = region
        
        laplacian = ndimage.laplace(gray)
        local_contrast = np.std(laplacian)
        
        return {
            "mean_intensity": float(mean_intensity),
            "std_intensity": float(std_intensity),
            "color_variance": float(color_variance),
            "local_contrast": float(local_contrast),
            "texture_score": float(min(1.0, std_intensity / 50)),
            "anomaly_detected": color_variance > 30,
        }
    
    def analyze_frequency_domain(
        self,
        image: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Perform frequency domain analysis to detect manipulation signatures.
        
        Args:
            image: Image as numpy array
            
        Returns:
            Frequency analysis results
        """
        # Convert to grayscale if needed
        if len(image.shape) == 3:
            gray = np.mean(image, axis=2)
        else:
            gray = image
        
        # Compute FFT
        fft = np.fft.fft2(gray)
        fft_shift = np.fft.fftshift(fft)
        magnitude = np.abs(fft_shift)
        
        # Analyze spectrum
        center = magnitude[magnitude.shape[0]//4:3*magnitude.shape[0]//4,
                         magnitude.shape[1]//4:3*magnitude.shape[1]//4]
        
        high_freq_energy = np.mean(magnitude) - np.mean(center)
        spectrum_uniformity = 1 - (np.std(magnitude) / (np.mean(magnitude) + 1e-6))
        
        # Check for periodic patterns (GAN fingerprints)
        periodic_score = 0.0
        # In production, detect specific frequency patterns
        
        return {
            "high_freq_energy": float(high_freq_energy),
            "spectrum_uniformity": float(spectrum_uniformity),
            "periodic_artifacts": periodic_score > 0.5,
            "gan_fingerprint_detected": False,
            "frequency_score": float(min(1.0, spectrum_uniformity)),
        }
    
    def generate_heatmap(
        self,
        image: np.ndarray,
        attention_map: Optional[np.ndarray] = None,
        resolution: int = 224,
    ) -> np.ndarray:
        """
        Generate heatmap visualization.
        
        Args:
            image: Original image
            attention_map: Model attention weights
            resolution: Output resolution
            
        Returns:
            Heatmap visualization as numpy array
        """
        # Resize image
        img = Image.fromarray(image.astype(np.uint8))
        img = img.resize((resolution, resolution))
        img_array = np.array(img)
        
        if attention_map is None:
            # Generate mock attention map
            y, x = np.ogrid[:resolution, :resolution]
            center_y, center_x = resolution // 2, resolution // 2
            mask = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            attention_map = 1 - (mask / mask.max())
        
        # Resize attention map
        if attention_map.shape != (resolution, resolution):
            attention_img = Image.fromarray((attention_map * 255).astype(np.uint8))
            attention_img = attention_img.resize((resolution, resolution))
            attention_map = np.array(attention_img) / 255.0
        
        # Create colormap (blue -> green -> yellow -> red)
        heatmap = np.zeros((resolution, resolution, 3), dtype=np.uint8)
        heatmap[:, :, 0] = (attention_map * 255).astype(np.uint8)  # Red channel
        heatmap[:, :, 1] = ((1 - attention_map) * 128).astype(np.uint8)  # Green
        
        # Blend with original
        alpha = 0.4
        blended = (alpha * heatmap + (1 - alpha) * img_array).astype(np.uint8)
        
        return blended


# Create global instance
image_processor = ImageProcessor()
