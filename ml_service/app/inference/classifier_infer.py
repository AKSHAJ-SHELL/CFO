"""
Inference engine for expense classifier
"""
import os
import json
import torch
from app.models.expense_classifier import ExpenseClassifier
from app.data.preprocess import clean_text, tokenize
from app.config import MODELS_DIR
from app.schemas.classifier_schema import ClassifierRequest, ClassifierResponse


class ClassifierInference:
	"""Expense classifier inference engine"""
	def __init__(self):
		self.model = None
		self.vocab = None
		self.categories = None
		self.load_model()
	
	def load_model(self):
		"""Load trained model and vocab"""
		try:
			model_path = os.path.join(MODELS_DIR, 'expense_classifier.pt')
			vocab_path = os.path.join(MODELS_DIR, 'classifier_vocab.json')
			categories_path = os.path.join(MODELS_DIR, 'classifier_categories.json')
			
			if not os.path.exists(model_path):
				print('Model not found, using fallback')
				return
			
			# Load vocab and categories
			with open(vocab_path, 'r') as f:
				self.vocab = json.load(f)
			with open(categories_path, 'r') as f:
				self.categories = json.load(f)
			
			# Load model
			self.model = ExpenseClassifier(
				vocab_size=len(self.vocab),
				embed_dim=128,
				hidden_dim=256,
				num_classes=len(self.categories),
				max_len=50
			)
			self.model.load_state_dict(torch.load(model_path, map_location='cpu'))
			self.model.eval()
			
			print('Classifier model loaded')
		except Exception as e:
			print(f'Error loading model: {e}')
			self.model = None
	
	def predict(self, request: ClassifierRequest) -> ClassifierResponse:
		"""Predict category for transaction"""
		if self.model is None:
			# Fallback classification
			return self._fallback_classify(request)
		
		try:
			# Tokenize
			tokens = tokenize(request.description, self.vocab)
			if len(tokens) > 50:
				tokens = tokens[:50]
			else:
				tokens = tokens + [0] * (50 - len(tokens))
			
			# Predict
			input_tensor = torch.tensor([tokens], dtype=torch.long)
			with torch.no_grad():
				outputs = self.model(input_tensor)
				probs = torch.softmax(outputs, dim=1)
				confidence, predicted_idx = torch.max(probs, 1)
			
			category = self.categories[predicted_idx.item()]
			confidence_score = confidence.item()
			
			return ClassifierResponse(
				transaction_id=request.transaction_id,
				predicted_category=category,
				confidence=confidence_score
			)
		except Exception as e:
			return self._fallback_classify(request)
	
	def _fallback_classify(self, request: ClassifierRequest) -> ClassifierResponse:
		"""Simple rule-based fallback"""
		desc_lower = request.description.lower()
		
		if any(word in desc_lower for word in ['rent', 'lease']):
			category = 'Rent'
		elif any(word in desc_lower for word in ['payroll', 'salary']):
			category = 'Payroll'
		elif any(word in desc_lower for word in ['ad', 'marketing']):
			category = 'Advertising'
		elif any(word in desc_lower for word in ['software', 'saas']):
			category = 'Software'
		elif any(word in desc_lower for word in ['stripe', 'payout']):
			category = 'Revenue'
		else:
			category = 'Other'
		
		return ClassifierResponse(
			transaction_id=request.transaction_id,
			predicted_category=category,
			confidence=0.7
		)

