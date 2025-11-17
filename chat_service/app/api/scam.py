"""
Scam detection endpoint
"""
from fastapi import APIRouter, HTTPException
from app.services.scam_classifier import get_classifier
from app.schemas.scam import ScamCheckRequest, ScamCheckResponse

router = APIRouter()


@router.post("/check", response_model=ScamCheckResponse)
async def check_scam(request: ScamCheckRequest):
    """
    Check if text contains scam indicators
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    classifier = get_classifier()
    score, is_scam, reason = classifier.classify(request.text)

    return ScamCheckResponse(
        score=score,
        is_scam=is_scam,
        reason=reason
    )

