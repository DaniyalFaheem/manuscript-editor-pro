"""
Video Processing Service
Handles video frame extraction, temporal analysis, and video-specific detection.
"""

import io
import os
import tempfile
from datetime import datetime
from typing import Any, Dict, Generator, List, Optional, Tuple

import numpy as np
from PIL import Image

from config.settings import settings


class VideoProcessor:
    """Service for processing and analyzing videos."""
    
    SUPPORTED_FORMATS = ["mp4", "avi", "mov", "mkv", "webm", "flv"]
    
    def __init__(self):
        self.frame_size = (224, 224)
    
    def extract_frames(
        self,
        video_data: bytes,
        sample_rate: int = 10,
        max_frames: int = 100,
    ) -> Generator[Tuple[int, np.ndarray], None, None]:
        """
        Extract frames from video.
        
        Args:
            video_data: Raw video bytes
            sample_rate: Extract every Nth frame
            max_frames: Maximum number of frames to extract
            
        Yields:
            Tuples of (frame_number, frame_array)
        """
        # In production, use cv2 or ffmpeg
        # For now, generate mock frames
        
        for i in range(0, max_frames * sample_rate, sample_rate):
            # Create a mock frame
            frame = np.random.randint(0, 255, (*self.frame_size, 3), dtype=np.uint8)
            yield i, frame
    
    def get_video_info(self, video_data: bytes) -> Dict[str, Any]:
        """
        Get video metadata and information.
        
        Args:
            video_data: Raw video bytes
            
        Returns:
            Video information dictionary
        """
        # In production, use cv2 or ffprobe
        return {
            "duration_seconds": 10.0,
            "fps": 30,
            "frame_count": 300,
            "width": 1920,
            "height": 1080,
            "codec": "h264",
            "bitrate": 5000000,
            "has_audio": True,
            "audio_codec": "aac",
        }
    
    def analyze_temporal_consistency(
        self,
        frame_predictions: List[float],
    ) -> Dict[str, Any]:
        """
        Analyze temporal consistency of predictions across frames.
        
        Args:
            frame_predictions: List of prediction scores for each frame
            
        Returns:
            Temporal consistency analysis results
        """
        predictions = np.array(frame_predictions)
        
        # Calculate statistics
        mean_pred = np.mean(predictions)
        std_pred = np.std(predictions)
        
        # Calculate frame-to-frame changes
        if len(predictions) > 1:
            diffs = np.abs(np.diff(predictions))
            max_diff = np.max(diffs)
            avg_diff = np.mean(diffs)
        else:
            max_diff = 0
            avg_diff = 0
        
        # Detect sudden jumps (potential splice points)
        jump_threshold = 0.3
        jumps = np.where(diffs > jump_threshold)[0] if len(predictions) > 1 else []
        
        # Calculate consistency score (1 = very consistent, 0 = inconsistent)
        consistency_score = max(0, 1 - std_pred - avg_diff)
        
        return {
            "mean_prediction": float(mean_pred),
            "std_prediction": float(std_pred),
            "max_frame_diff": float(max_diff),
            "avg_frame_diff": float(avg_diff),
            "consistency_score": float(consistency_score),
            "potential_splice_points": jumps.tolist() if len(jumps) > 0 else [],
            "is_temporally_consistent": consistency_score > 0.5,
        }
    
    def analyze_optical_flow(
        self,
        frames: List[np.ndarray],
    ) -> Dict[str, Any]:
        """
        Analyze optical flow between frames for motion consistency.
        
        Args:
            frames: List of video frames
            
        Returns:
            Optical flow analysis results
        """
        # In production, use cv2.calcOpticalFlowFarneback or similar
        # For now, return mock results
        
        return {
            "flow_magnitude_mean": 2.5,
            "flow_magnitude_std": 1.2,
            "motion_consistency": 0.85,
            "unnatural_motion_detected": False,
            "motion_regions": [
                {
                    "x": 100, "y": 80,
                    "width": 150, "height": 180,
                    "motion_score": 0.7,
                }
            ],
        }
    
    def detect_blink_patterns(
        self,
        face_regions: List[Dict[str, Any]],
        frame_indices: List[int],
        fps: float = 30.0,
    ) -> Dict[str, Any]:
        """
        Detect abnormal blink patterns in face regions.
        
        Normal blink rate: 15-20 per minute
        Normal blink duration: 100-400ms
        
        Args:
            face_regions: List of face region data per frame
            frame_indices: Frame indices corresponding to face regions
            fps: Video frames per second
            
        Returns:
            Blink pattern analysis results
        """
        # In production, use eye aspect ratio (EAR) tracking
        # For now, return mock results
        
        duration_seconds = len(frame_indices) / fps
        expected_blinks = duration_seconds * (17.5 / 60)  # ~17.5 blinks/min
        
        # Mock detected blinks
        detected_blinks = int(expected_blinks * np.random.uniform(0.8, 1.2))
        
        # Calculate blink rate
        blink_rate = (detected_blinks / duration_seconds) * 60
        
        # Check for abnormalities
        is_normal = 12 <= blink_rate <= 25
        
        return {
            "duration_seconds": float(duration_seconds),
            "detected_blinks": detected_blinks,
            "blink_rate_per_minute": float(blink_rate),
            "expected_range": [12, 25],
            "is_normal_rate": is_normal,
            "blink_timestamps": [],  # Would contain actual timestamps
            "anomaly_detected": not is_normal,
        }
    
    def detect_audio_sync(
        self,
        video_data: bytes,
    ) -> Dict[str, Any]:
        """
        Analyze audio-visual synchronization.
        
        Args:
            video_data: Raw video bytes
            
        Returns:
            Audio sync analysis results
        """
        # In production, use lip sync detection with audio analysis
        # For now, return mock results
        
        return {
            "has_audio": True,
            "has_speech": True,
            "lip_sync_score": 0.87,
            "audio_delay_ms": 12.5,
            "speech_segments": [
                {"start": 1.0, "end": 3.5},
                {"start": 5.0, "end": 8.2},
            ],
            "sync_anomalies": [],
            "is_synchronized": True,
        }
    
    def detect_compression_artifacts(
        self,
        frame: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Detect compression artifacts that may indicate manipulation.
        
        Args:
            frame: Video frame as numpy array
            
        Returns:
            Compression artifact analysis
        """
        # Analyze blockiness (8x8 DCT blocks in JPEG/H.264)
        height, width = frame.shape[:2]
        
        # Calculate block boundary differences
        block_size = 8
        h_blocks = height // block_size
        w_blocks = width // block_size
        
        # Convert to grayscale
        if len(frame.shape) == 3:
            gray = np.mean(frame, axis=2)
        else:
            gray = frame
        
        # Measure discontinuities at block boundaries
        h_boundaries = gray[::block_size, :]
        v_boundaries = gray[:, ::block_size]
        
        blockiness = (np.std(h_boundaries) + np.std(v_boundaries)) / 2
        
        return {
            "blockiness_score": float(blockiness),
            "estimated_quality": max(0, 100 - blockiness * 2),
            "double_compression_detected": blockiness > 30,
            "artifacts_detected": blockiness > 50,
        }
    
    def generate_frame_timeline(
        self,
        frame_results: List[Dict[str, Any]],
        video_info: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a timeline summary of frame analysis results.
        
        Args:
            frame_results: Per-frame analysis results
            video_info: Video metadata
            
        Returns:
            Timeline summary
        """
        fps = video_info.get("fps", 30)
        
        # Group results into segments
        segments = []
        current_segment = None
        
        for result in frame_results:
            is_fake = result.get("is_fake", False)
            
            if current_segment is None:
                current_segment = {
                    "start_frame": result["frame"],
                    "is_fake": is_fake,
                    "confidence_sum": result.get("confidence", 0.5),
                    "frame_count": 1,
                }
            elif current_segment["is_fake"] == is_fake:
                current_segment["confidence_sum"] += result.get("confidence", 0.5)
                current_segment["frame_count"] += 1
            else:
                # Close current segment
                current_segment["end_frame"] = result["frame"] - 1
                current_segment["avg_confidence"] = (
                    current_segment["confidence_sum"] / current_segment["frame_count"]
                )
                current_segment["start_time"] = current_segment["start_frame"] / fps
                current_segment["end_time"] = current_segment["end_frame"] / fps
                del current_segment["confidence_sum"]
                del current_segment["frame_count"]
                segments.append(current_segment)
                
                # Start new segment
                current_segment = {
                    "start_frame": result["frame"],
                    "is_fake": is_fake,
                    "confidence_sum": result.get("confidence", 0.5),
                    "frame_count": 1,
                }
        
        # Close last segment
        if current_segment and frame_results:
            current_segment["end_frame"] = frame_results[-1]["frame"]
            current_segment["avg_confidence"] = (
                current_segment["confidence_sum"] / current_segment["frame_count"]
            )
            current_segment["start_time"] = current_segment["start_frame"] / fps
            current_segment["end_time"] = current_segment["end_frame"] / fps
            del current_segment["confidence_sum"]
            del current_segment["frame_count"]
            segments.append(current_segment)
        
        return {
            "total_duration": video_info.get("duration_seconds", 0),
            "fps": fps,
            "segments": segments,
            "fake_segments_count": sum(1 for s in segments if s["is_fake"]),
            "real_segments_count": sum(1 for s in segments if not s["is_fake"]),
        }


# Create global instance
video_processor = VideoProcessor()
