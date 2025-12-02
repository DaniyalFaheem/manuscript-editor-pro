"""
Results routes for retrieving analysis results.
"""

import io
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse

from api.schemas import (
    AnalysisResponse,
    AnalysisStatus,
    ErrorResponse,
    TokenData,
)
from api.middleware.auth import get_current_user


router = APIRouter()


# In-memory results storage (use database in production)
results_cache: dict[str, dict] = {}


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResponse,
    responses={
        404: {"model": ErrorResponse},
    },
    summary="Get analysis result",
    description="Retrieve the result of a previous analysis by ID.",
)
async def get_result(
    analysis_id: str,
    user: Optional[TokenData] = Depends(get_current_user),
):
    """Get analysis result by ID."""
    result = results_cache.get(analysis_id)
    
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis {analysis_id} not found",
        )
    
    return result


@router.get(
    "/{analysis_id}/heatmap",
    responses={
        404: {"model": ErrorResponse},
    },
    summary="Get heatmap visualization",
    description="Get the heatmap visualization for an analysis.",
)
async def get_heatmap(
    analysis_id: str,
    format: str = Query(default="png", enum=["png", "jpg", "webp"]),
    resolution: int = Query(default=224, ge=64, le=1024),
    user: Optional[TokenData] = Depends(get_current_user),
):
    """Get heatmap visualization for an analysis."""
    # In production, generate or retrieve actual heatmap
    # For now, return a placeholder
    
    # Create a simple placeholder image
    from PIL import Image
    import numpy as np
    
    # Create a gradient heatmap placeholder
    heatmap = np.zeros((resolution, resolution, 3), dtype=np.uint8)
    for i in range(resolution):
        for j in range(resolution):
            # Create a red-yellow gradient
            heatmap[i, j] = [
                min(255, int(255 * (i / resolution))),
                min(255, int(128 * (j / resolution))),
                0
            ]
    
    img = Image.fromarray(heatmap)
    
    # Convert to bytes
    img_buffer = io.BytesIO()
    img_format = format.upper()
    if img_format == "JPG":
        img_format = "JPEG"
    img.save(img_buffer, format=img_format)
    img_buffer.seek(0)
    
    media_type = f"image/{format}"
    
    return StreamingResponse(
        img_buffer,
        media_type=media_type,
        headers={
            "Content-Disposition": f"inline; filename={analysis_id}_heatmap.{format}"
        }
    )


@router.get(
    "/{analysis_id}/report",
    responses={
        404: {"model": ErrorResponse},
    },
    summary="Download analysis report",
    description="Download a detailed report of the analysis.",
)
async def get_report(
    analysis_id: str,
    format: str = Query(default="json", enum=["json", "pdf"]),
    user: Optional[TokenData] = Depends(get_current_user),
):
    """Download detailed analysis report."""
    result = results_cache.get(analysis_id)
    
    if not result:
        # Create a mock result for demonstration
        result = {
            "id": analysis_id,
            "status": "completed",
            "created_at": datetime.utcnow().isoformat(),
            "result": {
                "is_deepfake": True,
                "confidence": 0.85,
                "models": {
                    "efficientnet": {"score": 0.87},
                    "xceptionnet": {"score": 0.83},
                }
            }
        }
    
    if format == "json":
        import json
        content = json.dumps(result, default=str, indent=2)
        
        return StreamingResponse(
            io.BytesIO(content.encode()),
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename={analysis_id}_report.json"
            }
        )
    
    elif format == "pdf":
        # Generate simple PDF report
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        
        # Add content
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, 750, "Deepfake Detection Report")
        
        pdf.setFont("Helvetica", 12)
        pdf.drawString(50, 720, f"Analysis ID: {analysis_id}")
        pdf.drawString(50, 700, f"Date: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(50, 660, "Results")
        
        pdf.setFont("Helvetica", 12)
        if isinstance(result.get("result"), dict):
            pdf.drawString(50, 640, f"Is Deepfake: {result['result'].get('is_deepfake', 'N/A')}")
            pdf.drawString(50, 620, f"Confidence: {result['result'].get('confidence', 'N/A')}")
        
        pdf.save()
        buffer.seek(0)
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={analysis_id}_report.pdf"
            }
        )


@router.get(
    "/{analysis_id}/frames",
    responses={
        404: {"model": ErrorResponse},
    },
    summary="Get video frame analysis",
    description="Get frame-by-frame analysis results for a video.",
)
async def get_frame_analysis(
    analysis_id: str,
    start_frame: int = Query(default=0, ge=0),
    end_frame: Optional[int] = Query(default=None),
    user: Optional[TokenData] = Depends(get_current_user),
):
    """Get frame-by-frame analysis for video."""
    # Mock frame analysis data
    frames = []
    for i in range(start_frame, min(end_frame or 30, 100)):
        import random
        frames.append({
            "frame_number": i,
            "timestamp_ms": i * 33,  # ~30fps
            "is_deepfake": random.random() > 0.5,
            "confidence": round(random.uniform(0.3, 0.95), 3),
            "face_detected": True,
            "face_region": {
                "x": 100 + random.randint(-20, 20),
                "y": 80 + random.randint(-20, 20),
                "width": 150,
                "height": 180,
            }
        })
    
    return {
        "analysis_id": analysis_id,
        "total_frames": 100,
        "analyzed_frames": len(frames),
        "frames": frames,
    }


@router.delete(
    "/{analysis_id}",
    status_code=204,
    summary="Delete analysis result",
    description="Delete an analysis result and associated files.",
)
async def delete_result(
    analysis_id: str,
    user: TokenData = Depends(get_current_user),
):
    """Delete an analysis result."""
    if analysis_id in results_cache:
        del results_cache[analysis_id]
    
    # In production, also delete files from storage
    return None
