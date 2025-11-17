"""
Scam detection service with heuristics and ML classifier
"""
import re
import os
import joblib
import numpy as np
from typing import Tuple, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from app.config import SCAM_MODEL_PATH


# Suspicious patterns for heuristic detection
SUSPICIOUS_PATTERNS = [
    r"wire.*now",
    r"urgent.*payment",
    r"immediately.*send",
    r"verify.*account",
    r"account.*details",
    r"tax.*refund",
    r"lottery.*winner",
    r"prize.*claim",
    r"click.*here.*verify",
    r"limited.*time.*offer",
    r"act.*now.*or.*lose",
    r"congratulations.*selected",
    r"free.*money",
    r"guaranteed.*return",
    r"no.*risk.*investment"
]

SUSPICIOUS_DOMAINS = [
    "verify-account",
    "secure-update",
    "urgent-action",
    "claim-prize",
    "tax-refund"
]


class ScamClassifier:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self._load_or_train_model()

    def _load_or_train_model(self):
        """Load existing model or train a new one"""
        if os.path.exists(SCAM_MODEL_PATH):
            try:
                self.model = joblib.load(SCAM_MODEL_PATH)
                return
            except:
                pass
        
        # Train a simple model on synthetic data
        self._train_model()

    def _train_model(self):
        """Train model on synthetic scam/legitimate examples"""
        # Synthetic training data
        scam_examples = [
            "URGENT: Wire $5000 immediately to verify your account or it will be closed",
            "Congratulations! You won $1,000,000. Click here to claim your prize",
            "Your account has been compromised. Verify your details immediately",
            "Tax refund available. Send your bank details to receive payment",
            "Limited time offer! Invest now for guaranteed 500% returns",
            "Your payment is overdue. Pay immediately or face legal action",
            "Free money! Just send $100 processing fee to receive $10,000",
            "Verify your account now or lose access forever",
            "You have been selected for a special investment opportunity",
            "Act now! Your account will be suspended in 24 hours"
        ]

        legitimate_examples = [
            "Invoice #12345 for services rendered. Payment due in 30 days",
            "Thank you for your recent purchase. Your order has been shipped",
            "Monthly statement for your account. Please review and pay by due date",
            "Your subscription renewal is coming up. Update your payment method",
            "Receipt for your payment of $250.00. Thank you for your business",
            "Quarterly financial report attached. Please review at your convenience",
            "Your account balance is $1,234.56. No action required",
            "Payment confirmation: Your invoice has been paid in full",
            "Annual report available for download. Review your financial summary",
            "Service agreement renewal notice. Please confirm your preferences"
        ]

        # Create training data
        X_train = scam_examples + legitimate_examples
        y_train = [1] * len(scam_examples) + [0] * len(legitimate_examples)

        # Train pipeline
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=5000)),
            ('clf', LogisticRegression(max_iter=1000, random_state=42))
        ])

        pipeline.fit(X_train, y_train)
        self.model = pipeline

        # Save model
        os.makedirs(os.path.dirname(SCAM_MODEL_PATH), exist_ok=True)
        joblib.dump(pipeline, SCAM_MODEL_PATH)

    def heuristic_score(self, text: str) -> Tuple[float, List[str]]:
        """Calculate heuristic-based scam score"""
        score = 0.0
        reasons = []
        lowered = text.lower()

        # Check suspicious patterns
        pattern_matches = 0
        for pattern in SUSPICIOUS_PATTERNS:
            if re.search(pattern, lowered, re.IGNORECASE):
                pattern_matches += 1
                score += 0.15

        if pattern_matches > 0:
            reasons.append(f"Found {pattern_matches} suspicious phrase pattern(s)")

        # Check for excessive uppercase
        caps_ratio = sum(1 for c in text if c.isupper()) / max(1, len(text))
        if caps_ratio > 0.3:
            score += 0.2
            reasons.append("Excessive use of uppercase letters")

        # Check for long numeric sequences (account numbers, etc.)
        if re.search(r"\d{8,}", text):
            score += 0.15
            reasons.append("Contains long numeric sequences (possible account numbers)")

        # Check for suspicious domains
        for domain in SUSPICIOUS_DOMAINS:
            if domain in lowered:
                score += 0.25
                reasons.append(f"Suspicious domain pattern: {domain}")

        # Check for urgency indicators
        urgency_words = ["immediately", "urgent", "now", "asap", "hurry", "limited time"]
        urgency_count = sum(1 for word in urgency_words if word in lowered)
        if urgency_count >= 2:
            score += 0.2
            reasons.append("Multiple urgency indicators detected")

        return min(score, 0.99), reasons

    def ml_score(self, text: str) -> float:
        """Calculate ML-based scam score"""
        if self.model is None:
            return 0.5  # Neutral if model not available

        try:
            proba = self.model.predict_proba([text])[0]
            # Return probability of scam class (class 1)
            return float(proba[1]) if len(proba) > 1 else 0.5
        except:
            return 0.5

    def classify(self, text: str) -> Tuple[float, bool, str]:
        """
        Classify text as scam or not.
        Returns: (score, is_scam, reason)
        """
        if not text or not text.strip():
            return 0.0, False, "Empty text"

        # Get heuristic score
        heuristic_score, heuristic_reasons = self.heuristic_score(text)

        # Get ML score
        ml_score = self.ml_score(text)

        # Combine scores (weighted average: 40% heuristic, 60% ML)
        combined_score = (heuristic_score * 0.4) + (ml_score * 0.6)

        # Determine if scam (threshold: 0.6)
        is_scam = combined_score >= 0.6

        # Build reason string
        reasons = []
        if heuristic_reasons:
            reasons.extend(heuristic_reasons)
        if ml_score > 0.7:
            reasons.append("ML model indicates high scam probability")
        elif ml_score < 0.3:
            reasons.append("ML model indicates low scam probability")

        reason = "; ".join(reasons) if reasons else "No obvious scam indicators detected"

        return round(combined_score, 3), is_scam, reason


# Singleton instance
_classifier_instance = None


def get_classifier() -> ScamClassifier:
    """Get or create ScamClassifier instance"""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = ScamClassifier()
    return _classifier_instance

