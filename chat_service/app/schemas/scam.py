"""
Scam detection schemas
"""
from pydantic import BaseModel


class ScamCheckRequest(BaseModel):
    text: str


class ScamCheckResponse(BaseModel):
    score: float
    is_scam: bool
    reason: str

