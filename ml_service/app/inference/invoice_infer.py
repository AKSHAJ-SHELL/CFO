"""
Inference functions for invoice-related ML models
"""
from pathlib import Path
import logging
from ..models.payment_predictor import PaymentPredictor
from ..models.message_generator import MessageGenerator

logger = logging.getLogger(__name__)

# Global model instances
payment_predictor = None
message_generator = None


def get_payment_predictor():
    """Get or initialize payment predictor model"""
    global payment_predictor
    if payment_predictor is None:
        model_path = Path(__file__).parent.parent / 'trained_models' / 'payment_predictor.joblib'
        try:
            if model_path.exists():
                payment_predictor = PaymentPredictor(model_path=str(model_path))
                logger.info("Payment predictor model loaded")
            else:
                payment_predictor = PaymentPredictor()
                logger.warning("Payment predictor model not found, using heuristic mode")
        except Exception as e:
            logger.error(f"Error loading payment predictor: {e}")
            payment_predictor = PaymentPredictor()
    return payment_predictor


def get_message_generator():
    """Get or initialize message generator"""
    global message_generator
    if message_generator is None:
        message_generator = MessageGenerator()
        logger.info("Message generator initialized")
    return message_generator


def predict_payment(invoice_data: dict) -> dict:
    """
    Predict when an invoice will be paid
    
    Args:
        invoice_data: Dictionary with invoice and customer information
    
    Returns:
        Prediction results
    """
    predictor = get_payment_predictor()
    return predictor.predict(invoice_data)


def generate_collection_message(context: dict, message_type: str = None, tone: str = None) -> dict:
    """
    Generate a collection message for an invoice
    
    Args:
        context: Dictionary with invoice and customer information
        message_type: Optional message type (auto-suggested if not provided)
        tone: Optional tone (auto-suggested if not provided)
    
    Returns:
        Generated message with subject and body
    """
    generator = get_message_generator()
    
    # Auto-suggest if not provided
    if message_type is None:
        message_type = generator.suggest_message_type(context)
    
    if tone is None:
        tone = generator.suggest_tone(context)
    
    return generator.generate_message(context, message_type, tone)

