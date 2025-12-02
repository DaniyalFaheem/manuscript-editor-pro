"""
Feedback routes for collecting user feedback on analysis results.
"""

import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from api.schemas import (
    FeedbackRequest,
    FeedbackResponse,
    Prediction,
    TokenData,
)
from api.middleware.auth import get_current_user


router = APIRouter()


# In-memory feedback storage (use database in production)
feedback_storage: dict[str, dict] = {}


@router.post(
    "",
    response_model=FeedbackResponse,
    status_code=201,
    summary="Submit feedback",
    description="Submit feedback on an analysis result to help improve the models.",
)
async def submit_feedback(
    body: FeedbackRequest,
    user: Optional[TokenData] = Depends(get_current_user),
):
    """Submit feedback on an analysis result."""
    feedback_id = f"feedback_{uuid.uuid4().hex[:12]}"
    
    feedback_storage[feedback_id] = {
        "id": feedback_id,
        "analysis_id": body.analysis_id,
        "is_correct": body.is_correct,
        "actual_label": body.actual_label.value if body.actual_label else None,
        "comments": body.comments,
        "user": user.sub if user else "anonymous",
        "created_at": datetime.utcnow(),
    }
    
    return FeedbackResponse(
        id=feedback_id,
        analysis_id=body.analysis_id,
        status="received",
        message="Thank you for your feedback! It will help improve our detection models.",
    )


@router.get(
    "",
    summary="List feedback",
    description="List all feedback (admin only).",
)
async def list_feedback(
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    is_correct: Optional[bool] = Query(default=None),
    user: TokenData = Depends(get_current_user),
):
    """List all feedback."""
    # Filter feedback
    all_feedback = list(feedback_storage.values())
    
    if is_correct is not None:
        all_feedback = [f for f in all_feedback if f["is_correct"] == is_correct]
    
    # Sort by created_at descending
    all_feedback.sort(key=lambda x: x["created_at"], reverse=True)
    
    # Paginate
    paginated = all_feedback[offset:offset + limit]
    
    return {
        "total": len(all_feedback),
        "limit": limit,
        "offset": offset,
        "feedback": paginated,
    }


@router.get(
    "/stats",
    summary="Feedback statistics",
    description="Get statistics about feedback received.",
)
async def feedback_stats(
    user: TokenData = Depends(get_current_user),
):
    """Get feedback statistics."""
    all_feedback = list(feedback_storage.values())
    
    total = len(all_feedback)
    correct = sum(1 for f in all_feedback if f["is_correct"])
    incorrect = total - correct
    
    # Count by actual label
    by_label = {}
    for f in all_feedback:
        label = f.get("actual_label", "unknown") or "unknown"
        by_label[label] = by_label.get(label, 0) + 1
    
    return {
        "total_feedback": total,
        "correct_predictions": correct,
        "incorrect_predictions": incorrect,
        "accuracy_from_feedback": round(correct / total, 3) if total > 0 else None,
        "by_actual_label": by_label,
    }


@router.get(
    "/{feedback_id}",
    summary="Get feedback",
    description="Get a specific feedback entry.",
)
async def get_feedback(
    feedback_id: str,
    user: TokenData = Depends(get_current_user),
):
    """Get a specific feedback entry."""
    feedback = feedback_storage.get(feedback_id)
    
    if not feedback:
        raise HTTPException(
            status_code=404,
            detail=f"Feedback {feedback_id} not found",
        )
    
    return feedback
