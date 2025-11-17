"""
Tests for scam detection
"""
import pytest
from app.services.scam_classifier import ScamClassifier, get_classifier


def test_scam_classifier_initialization():
    """Test ScamClassifier can be initialized"""
    classifier = ScamClassifier()
    assert classifier is not None
    assert classifier.model is not None


def test_heuristic_detection():
    """Test heuristic-based scam detection"""
    classifier = ScamClassifier()
    
    # Test obvious scam
    scam_text = "URGENT: Wire $5000 immediately to verify your account or it will be closed"
    score, reasons = classifier.heuristic_score(scam_text)
    assert score > 0.5
    assert len(reasons) > 0
    
    # Test legitimate text
    legit_text = "Invoice #12345 for services rendered. Payment due in 30 days"
    score2, reasons2 = classifier.heuristic_score(legit_text)
    assert score2 < 0.5


def test_ml_classification():
    """Test ML-based classification"""
    classifier = ScamClassifier()
    
    # Test scam text
    scam_text = "URGENT: Wire $5000 immediately to verify your account"
    score = classifier.ml_score(scam_text)
    assert 0 <= score <= 1
    
    # Test legitimate text
    legit_text = "Invoice #12345 for services rendered. Payment due in 30 days"
    score2 = classifier.ml_score(legit_text)
    assert 0 <= score2 <= 1


def test_classify():
    """Test full classification pipeline"""
    classifier = ScamClassifier()
    
    # Test scam
    scam_text = "URGENT: Wire $5000 immediately to verify your account or it will be closed"
    score, is_scam, reason = classifier.classify(scam_text)
    assert 0 <= score <= 1
    assert isinstance(is_scam, bool)
    assert len(reason) > 0
    # Scam text should likely be classified as scam
    if score >= 0.6:
        assert is_scam is True
    
    # Test legitimate
    legit_text = "Invoice #12345 for services rendered. Payment due in 30 days"
    score2, is_scam2, reason2 = classifier.classify(legit_text)
    assert 0 <= score2 <= 1
    assert isinstance(is_scam2, bool)
    assert len(reason2) > 0


def test_classify_empty_text():
    """Test classification handles empty text"""
    classifier = ScamClassifier()
    score, is_scam, reason = classifier.classify("")
    assert score == 0.0
    assert is_scam is False
    assert "Empty" in reason


def test_get_classifier_singleton():
    """Test get_classifier returns singleton instance"""
    classifier1 = get_classifier()
    classifier2 = get_classifier()
    assert classifier1 is classifier2

