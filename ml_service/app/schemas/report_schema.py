"""
Schemas for report generator API
"""
from pydantic import BaseModel
from typing import Dict, Any


class ReportRequest(BaseModel):
	org_id: str
	metrics: Dict[str, Any]


class ReportResponse(BaseModel):
	org_id: str
	summary_text: str
	model_version: str = 'v1.0.0'

