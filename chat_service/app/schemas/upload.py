"""
File upload schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class UploadResponse(BaseModel):
    uploadId: str
    filename: str
    detectedType: str
    previewRecords: int
    message: Optional[str] = None


class ParseRequest(BaseModel):
    uploadId: str
    mapping: Optional[Dict[str, str]] = None  # Column mapping for CSV/XLSX


class ParseResponse(BaseModel):
    taskId: str
    status: str
    records: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None

