"""
Inference engine for report generator
"""
import os
import json
import torch
from app.models.report_generator import ReportGenerator
from app.config import MODELS_DIR
from app.schemas.report_schema import ReportRequest, ReportResponse


class ReportInference:
	"""Report generator inference engine"""
	def __init__(self):
		self.model = None
		self.vocab = None
		self.idx_to_word = None
		self.load_model()
	
	def load_model(self):
		"""Load trained model and vocab"""
		try:
			model_path = os.path.join(MODELS_DIR, 'report_generator.pt')
			vocab_path = os.path.join(MODELS_DIR, 'report_vocab.json')
			
			if not os.path.exists(model_path):
				print('Report generator model not found, using fallback')
				return
			
			# Load vocab
			with open(vocab_path, 'r') as f:
				self.vocab = json.load(f)
				self.idx_to_word = {idx: word for word, idx in self.vocab.items()}
			
			# Load model
			self.model = ReportGenerator(
				metric_dim=5,
				vocab_size=len(self.vocab),
				embed_dim=128,
				hidden_dim=256,
				max_len=200
			)
			self.model.load_state_dict(torch.load(model_path, map_location='cpu'))
			self.model.eval()
			
			print('Report generator model loaded')
		except Exception as e:
			print(f'Error loading model: {e}')
			self.model = None
	
	def generate(self, request: ReportRequest) -> ReportResponse:
		"""Generate financial report summary"""
		if self.model is None:
			return self._fallback_generate(request)
		
		try:
			# Normalize metrics
			metrics = request.metrics
			metric_vec = torch.tensor([[
				metrics.get('revenue', 0) / 50000,
				metrics.get('expenses', 0) / 50000,
				metrics.get('net', 0) / 50000,
				metrics.get('runway_days', 0) / 180,
				1.0 if metrics.get('net', 0) > 0 else 0.0
			]], dtype=torch.float32)
			
			# Generate
			with torch.no_grad():
				generated_tokens = self.model(metric_vec)
			
			# Decode tokens to text
			words = []
			for token_idx in generated_tokens[0].tolist():
				if token_idx == 0:  # PAD
					break
				if token_idx in self.idx_to_word:
					word = self.idx_to_word[token_idx]
					if word not in ['<PAD>', '<UNK>']:
						words.append(word)
			
			summary = ' '.join(words) if words else self._fallback_generate(request).summary_text
			
			return ReportResponse(
				org_id=request.org_id,
				summary_text=summary
			)
		except Exception as e:
			return self._fallback_generate(request)
	
	def _fallback_generate(self, request: ReportRequest) -> ReportResponse:
		"""Fallback summary generation"""
		metrics = request.metrics
		revenue = metrics.get('revenue', 0)
		expenses = metrics.get('expenses', 0)
		net = metrics.get('net', revenue - expenses)
		runway = metrics.get('runway_days', 0)
		
		if net > 0:
			summary = f'Strong financial performance. Revenue: ${revenue:,.2f}, Expenses: ${expenses:,.2f}, Net: ${net:,.2f}. Cash runway: {runway} days.'
		else:
			summary = f'Revenue of ${revenue:,.2f} below expenses of ${expenses:,.2f}. Net loss: ${abs(net):,.2f}. Cash runway: {runway} days. Consider cost reduction.'
		
		return ReportResponse(
			org_id=request.org_id,
			summary_text=summary
		)

