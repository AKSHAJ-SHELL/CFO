"""
Chat schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ChatMessage(BaseModel):
    text: str
    conv_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatChunk(BaseModel):
    type: str  # "chunk" or "done" or "error"
    text: Optional[str] = None
    message: Optional[str] = None
    sources: Optional[List[Dict[str, str]]] = None


class SourceCitation(BaseModel):
    name: str
    credentials: str
    url: Optional[str] = None

