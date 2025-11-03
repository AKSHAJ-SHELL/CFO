"""
Data preprocessing utilities
"""
import re
from typing import List
import torch
from torch.utils.data import Dataset


def clean_text(text: str) -> str:
	"""Clean transaction description"""
	# Handle non-string inputs (NaN, None, lists, etc.)
	if isinstance(text, list):
		# If it's a list, join it if it contains strings, otherwise convert
		if text and isinstance(text[0], str):
			text = ' '.join(text)
		else:
			text = ' '.join(str(item) for item in text)
	elif not isinstance(text, str):
		text = str(text) if text is not None else ''
	# Remove special characters, normalize whitespace
	text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
	text = re.sub(r'\s+', ' ', text)
	return text.lower().strip()


def tokenize(text: str, vocab: dict) -> List[int]:
	"""Simple tokenization using vocabulary"""
	words = clean_text(text).split()
	return [vocab.get(word, vocab.get('<UNK>', 0)) for word in words]


class TransactionDataset(Dataset):
	"""PyTorch dataset for transactions"""
	def __init__(self, texts, labels, vocab, max_len=50):
		self.texts = texts
		self.labels = labels
		self.vocab = vocab
		self.max_len = max_len
	
	def __len__(self):
		return len(self.texts)
	
	def __getitem__(self, idx):
		text = self.texts[idx]
		label = self.labels[idx]
		
		# Tokenize and pad
		tokens = tokenize(text, self.vocab)
		if len(tokens) > self.max_len:
			tokens = tokens[:self.max_len]
		else:
			tokens = tokens + [0] * (self.max_len - len(tokens))
		
		return torch.tensor(tokens, dtype=torch.long), torch.tensor(label, dtype=torch.long)


class ReportDataset(Dataset):
	"""PyTorch dataset for reports"""
	def __init__(self, metrics, summaries, vocab, max_len=200):
		self.metrics = metrics
		self.summaries = summaries
		self.vocab = vocab
		self.max_len = max_len
	
	def __len__(self):
		return len(self.metrics)
	
	def __getitem__(self, idx):
		metric_vec = torch.tensor(self.metrics[idx], dtype=torch.float32)
		
		# Tokenize summary
		summary = self.summaries[idx]
		# Ensure summary is a string (handle NaN, None, lists, etc.)
		if isinstance(summary, list):
			# If it's a list, try to join it if it contains strings, otherwise convert
			if summary and isinstance(summary[0], str):
				summary = ' '.join(summary)
			else:
				summary = ' '.join(str(item) for item in summary)
		elif not isinstance(summary, str):
			summary = str(summary) if summary is not None else ''
		tokens = tokenize(summary, self.vocab)
		if len(tokens) > self.max_len:
			tokens = tokens[:self.max_len]
		else:
			tokens = tokens + [0] * (self.max_len - len(tokens))
		
		return metric_vec, torch.tensor(tokens, dtype=torch.long)

