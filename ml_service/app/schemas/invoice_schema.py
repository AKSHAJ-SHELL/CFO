"""
Schemas for Invoice-related ML services
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict
from datetime import date


class PaymentPredictionRequest(BaseModel):
    """Request schema for payment prediction"""
    invoice_amount: float = Field(..., description="Invoice amount in dollars")
    issue_date: str = Field(..., description="Invoice issue date (ISO format)")
    days_until_due: int = Field(..., description="Days until invoice is due")
    payment_terms_days: int = Field(30, description="Payment terms in days")
    customer_avg_days_to_pay: float = Field(0, description="Customer's average days to pay")
    customer_reliability_score: float = Field(50, description="Customer reliability score (0-100)")
    customer_payment_count: int = Field(0, description="Number of previous payments from customer")
    customer_avg_invoice_amount: float = Field(0, description="Customer's average invoice amount")


class PaymentPredictionResponse(BaseModel):
    """Response schema for payment prediction"""
    predicted_days: int = Field(..., description="Predicted days until payment")
    confidence_score: float = Field(..., description="Confidence score (0-1)")
    risk_level: str = Field(..., description="Risk level (low, medium, high)")
    model_version: str = Field(..., description="Model version used")
    factors: Dict = Field(default_factory=dict, description="Important factors in prediction")


class MessageGenerationRequest(BaseModel):
    """Request schema for message generation"""
    customer_name: str = Field(..., description="Customer name")
    org_name: str = Field(..., description="Organization name")
    invoice_number: str = Field(..., description="Invoice number")
    amount: float = Field(..., description="Invoice amount")
    due_date: str = Field(..., description="Invoice due date (ISO format)")
    days_until_due: Optional[int] = Field(None, description="Days until due date")
    days_overdue: Optional[int] = Field(0, description="Days overdue")
    customer_reliability_score: Optional[float] = Field(None, description="Customer reliability score")
    invoice_status: Optional[str] = Field(None, description="Invoice status")
    payment_link: Optional[str] = Field(None, description="Payment link URL")
    message_type: Optional[str] = Field(None, description="Message type (auto-suggested if not provided)")
    tone: Optional[str] = Field(None, description="Message tone (auto-suggested if not provided)")


class MessageGenerationResponse(BaseModel):
    """Response schema for message generation"""
    subject: str = Field(..., description="Email subject line")
    body: str = Field(..., description="Email body text")
    tone: str = Field(..., description="Message tone used")
    message_type: str = Field(..., description="Message type used")
    generated_at: str = Field(..., description="Generation timestamp")

