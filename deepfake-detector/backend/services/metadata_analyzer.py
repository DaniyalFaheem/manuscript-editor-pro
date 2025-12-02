"""
Metadata Analyzer Service
Extracts and analyzes metadata from images and videos.
"""

import io
from datetime import datetime
from typing import Any, Dict, List, Optional

import exifread
from PIL import Image


class MetadataAnalyzer:
    """Service for analyzing media metadata."""
    
    # Known editing software patterns
    EDITING_SOFTWARE = [
        "photoshop", "lightroom", "gimp", "affinity",
        "deepfake", "faceswap", "face2face", "deepart",
        "fakeapp", "reface", "morpheus", "remini",
    ]
    
    # Known AI generation patterns
    AI_GENERATORS = [
        "midjourney", "stable diffusion", "dall-e", "dalle",
        "artbreeder", "runway", "synthesia", "d-id",
    ]
    
    def __init__(self):
        pass
    
    def analyze_image_metadata(
        self,
        image_data: bytes,
    ) -> Dict[str, Any]:
        """
        Analyze image metadata for manipulation indicators.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Metadata analysis results
        """
        result = {
            "exif": self._extract_exif(image_data),
            "file_info": self._get_file_info(image_data),
            "warnings": [],
            "risk_factors": [],
            "trust_score": 1.0,
        }
        
        # Analyze for suspicious patterns
        self._check_software_warnings(result)
        self._check_consistency(result)
        self._calculate_trust_score(result)
        
        return result
    
    def _extract_exif(self, image_data: bytes) -> Dict[str, Any]:
        """Extract EXIF data from image."""
        exif_data = {
            "camera_make": None,
            "camera_model": None,
            "software": None,
            "datetime_original": None,
            "datetime_digitized": None,
            "datetime_modified": None,
            "gps_info": None,
            "orientation": None,
            "exposure": None,
            "focal_length": None,
            "iso": None,
            "flash": None,
            "copyright": None,
            "artist": None,
        }
        
        try:
            tags = exifread.process_file(io.BytesIO(image_data))
            
            # Camera info
            if "Image Make" in tags:
                exif_data["camera_make"] = str(tags["Image Make"])
            if "Image Model" in tags:
                exif_data["camera_model"] = str(tags["Image Model"])
            if "Image Software" in tags:
                exif_data["software"] = str(tags["Image Software"])
            
            # Dates
            if "EXIF DateTimeOriginal" in tags:
                exif_data["datetime_original"] = str(tags["EXIF DateTimeOriginal"])
            if "EXIF DateTimeDigitized" in tags:
                exif_data["datetime_digitized"] = str(tags["EXIF DateTimeDigitized"])
            if "Image DateTime" in tags:
                exif_data["datetime_modified"] = str(tags["Image DateTime"])
            
            # Camera settings
            if "EXIF ExposureTime" in tags:
                exif_data["exposure"] = str(tags["EXIF ExposureTime"])
            if "EXIF FocalLength" in tags:
                exif_data["focal_length"] = str(tags["EXIF FocalLength"])
            if "EXIF ISOSpeedRatings" in tags:
                exif_data["iso"] = str(tags["EXIF ISOSpeedRatings"])
            if "EXIF Flash" in tags:
                exif_data["flash"] = str(tags["EXIF Flash"])
            if "Image Orientation" in tags:
                exif_data["orientation"] = str(tags["Image Orientation"])
            
            # GPS
            gps_tags = ["GPS GPSLatitude", "GPS GPSLongitude", "GPS GPSAltitude"]
            if any(tag in tags for tag in gps_tags):
                exif_data["gps_info"] = {
                    "latitude": str(tags.get("GPS GPSLatitude", "")),
                    "latitude_ref": str(tags.get("GPS GPSLatitudeRef", "")),
                    "longitude": str(tags.get("GPS GPSLongitude", "")),
                    "longitude_ref": str(tags.get("GPS GPSLongitudeRef", "")),
                    "altitude": str(tags.get("GPS GPSAltitude", "")),
                }
            
            # Attribution
            if "Image Copyright" in tags:
                exif_data["copyright"] = str(tags["Image Copyright"])
            if "Image Artist" in tags:
                exif_data["artist"] = str(tags["Image Artist"])
                
        except Exception as e:
            exif_data["extraction_error"] = str(e)
        
        return exif_data
    
    def _get_file_info(self, image_data: bytes) -> Dict[str, Any]:
        """Get basic file information."""
        info = {
            "size_bytes": len(image_data),
            "format": None,
            "mode": None,
            "width": None,
            "height": None,
        }
        
        try:
            image = Image.open(io.BytesIO(image_data))
            info["format"] = image.format
            info["mode"] = image.mode
            info["width"] = image.width
            info["height"] = image.height
        except Exception:
            pass
        
        return info
    
    def _check_software_warnings(self, result: Dict[str, Any]) -> None:
        """Check for suspicious software in metadata."""
        software = result["exif"].get("software", "") or ""
        software_lower = software.lower()
        
        # Check for editing software
        for editor in self.EDITING_SOFTWARE:
            if editor in software_lower:
                result["warnings"].append(
                    f"Image was processed with editing software: {software}"
                )
                result["risk_factors"].append("editing_software_detected")
                break
        
        # Check for AI generators
        for generator in self.AI_GENERATORS:
            if generator in software_lower:
                result["warnings"].append(
                    f"Image may have been generated by AI: {software}"
                )
                result["risk_factors"].append("ai_generator_detected")
                break
    
    def _check_consistency(self, result: Dict[str, Any]) -> None:
        """Check for metadata consistency issues."""
        exif = result["exif"]
        
        # Check date consistency
        dates = []
        if exif.get("datetime_original"):
            dates.append(("original", exif["datetime_original"]))
        if exif.get("datetime_digitized"):
            dates.append(("digitized", exif["datetime_digitized"]))
        if exif.get("datetime_modified"):
            dates.append(("modified", exif["datetime_modified"]))
        
        if len(dates) >= 2:
            # Check if modified date is before original
            try:
                orig_date = dates[0][1]
                mod_date = dates[-1][1]
                # Parse dates (format: YYYY:MM:DD HH:MM:SS)
                # In production, properly parse and compare
                if mod_date < orig_date:
                    result["warnings"].append(
                        "Modification date is before original capture date"
                    )
                    result["risk_factors"].append("date_inconsistency")
            except Exception:
                pass
        
        # Check for missing camera info with editing software
        if exif.get("software") and not exif.get("camera_make"):
            result["warnings"].append(
                "Editing software present but no camera information"
            )
            result["risk_factors"].append("missing_camera_info")
        
        # Check for suspicious resolution
        file_info = result["file_info"]
        if file_info.get("width") and file_info.get("height"):
            # Very specific resolutions may indicate AI generation
            common_ai_sizes = [(512, 512), (768, 768), (1024, 1024)]
            size = (file_info["width"], file_info["height"])
            if size in common_ai_sizes:
                result["warnings"].append(
                    f"Image size {size} is common for AI-generated images"
                )
                result["risk_factors"].append("ai_typical_size")
    
    def _calculate_trust_score(self, result: Dict[str, Any]) -> None:
        """Calculate overall trust score based on analysis."""
        score = 1.0
        
        # Reduce score for each risk factor
        risk_penalties = {
            "editing_software_detected": 0.1,
            "ai_generator_detected": 0.4,
            "date_inconsistency": 0.2,
            "missing_camera_info": 0.1,
            "ai_typical_size": 0.15,
        }
        
        for factor in result["risk_factors"]:
            score -= risk_penalties.get(factor, 0.05)
        
        # Boost score for complete camera info
        exif = result["exif"]
        if exif.get("camera_make") and exif.get("camera_model"):
            score += 0.1
        if exif.get("datetime_original"):
            score += 0.05
        if exif.get("gps_info"):
            score += 0.1
        
        result["trust_score"] = max(0.0, min(1.0, score))
    
    def verify_image_integrity(
        self,
        image_data: bytes,
    ) -> Dict[str, Any]:
        """
        Verify image file integrity and check for tampering.
        
        Args:
            image_data: Raw image bytes
            
        Returns:
            Integrity verification results
        """
        result = {
            "is_valid": True,
            "format_valid": True,
            "structure_valid": True,
            "issues": [],
        }
        
        try:
            # Try to load the image
            image = Image.open(io.BytesIO(image_data))
            image.verify()  # Verify file integrity
            
            # Reload and check
            image = Image.open(io.BytesIO(image_data))
            
            # Check for unusual format mismatches
            # (e.g., PNG magic bytes but JPEG content)
            magic_bytes = image_data[:10]
            
            if image.format == "JPEG":
                if not magic_bytes.startswith(b'\xff\xd8'):
                    result["issues"].append("JPEG format mismatch")
                    result["structure_valid"] = False
            elif image.format == "PNG":
                if not magic_bytes.startswith(b'\x89PNG'):
                    result["issues"].append("PNG format mismatch")
                    result["structure_valid"] = False
            
            # Check for truncated images
            try:
                image.load()
            except Exception:
                result["issues"].append("Image may be truncated or corrupted")
                result["is_valid"] = False
                
        except Exception as e:
            result["is_valid"] = False
            result["format_valid"] = False
            result["issues"].append(f"Failed to load image: {str(e)}")
        
        return result


# Create global instance
metadata_analyzer = MetadataAnalyzer()
