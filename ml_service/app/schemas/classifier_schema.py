"""
Schemas for classifier API
"""
from pydantic import BaseModel
from typing import Optional


class ClassifierRequest(BaseModel):
	transaction_id: str
	description: str
	amount: float
	currency: str = 'USD'


class ClassifierResponse(BaseModel):
	transaction_id: str
	predicted_category: str
	confidence: float

