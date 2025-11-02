"""
Train expense classifier model
"""
import os
import sys
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from collections import Counter
import json
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.models.expense_classifier import ExpenseClassifier
from app.data.preprocess import TransactionDataset, clean_text
from app.config import MODELS_DIR, DATA_DIR, LOGS_DIR

CATEGORIES = [
	'Advertising', 'Payroll', 'Rent', 'Software', 'Utilities',
	'Professional Services', 'Supplies', 'Travel', 'Revenue', 'Other'
]
CATEGORY_TO_IDX = {cat: idx for idx, cat in enumerate(CATEGORIES)}


def build_vocab(texts, min_freq=2):
	"""Build vocabulary from texts"""
	word_counts = Counter()
	for text in texts:
		words = clean_text(text).split()
		word_counts.update(words)
	
	vocab = {'<PAD>': 0, '<UNK>': 1}
	for word, count in word_counts.items():
		if count >= min_freq:
			vocab[word] = len(vocab)
	
	return vocab


def train():
	"""Train the classifier"""
	print('Loading data...')
	df = pd.read_csv(os.path.join(DATA_DIR, 'transactions.csv'))
	
	# Build vocabulary
	print('Building vocabulary...')
	vocab = build_vocab(df['description'].tolist())
	
	# Prepare data
	texts = df['description'].tolist()
	labels = [CATEGORY_TO_IDX[cat] for cat in df['category'].tolist()]
	
	# Split train/test
	split_idx = int(len(texts) * 0.8)
	train_texts = texts[:split_idx]
	train_labels = labels[:split_idx]
	test_texts = texts[split_idx:]
	test_labels = labels[split_idx:]
	
	# Create datasets
	train_dataset = TransactionDataset(train_texts, train_labels, vocab)
	test_dataset = TransactionDataset(test_texts, test_labels, vocab)
	
	train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
	test_loader = DataLoader(test_dataset, batch_size=32)
	
	# Initialize model
	model = ExpenseClassifier(
		vocab_size=len(vocab),
		embed_dim=128,
		hidden_dim=256,
		num_classes=len(CATEGORIES),
		max_len=50
	)
	
	# Training setup
	criterion = nn.CrossEntropyLoss()
	optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
	
	# Training loop
	num_epochs = 5
	device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
	model.to(device)
	
	print(f'Training on {device}...')
	
	for epoch in range(num_epochs):
		model.train()
		total_loss = 0
		correct = 0
		total = 0
		
		for batch_texts, batch_labels in train_loader:
			batch_texts = batch_texts.to(device)
			batch_labels = batch_labels.to(device)
			
			optimizer.zero_grad()
			outputs = model(batch_texts)
			loss = criterion(outputs, batch_labels)
			loss.backward()
			optimizer.step()
			
			total_loss += loss.item()
			_, predicted = torch.max(outputs.data, 1)
			total += batch_labels.size(0)
			correct += (predicted == batch_labels).sum().item()
		
		accuracy = 100 * correct / total
		avg_loss = total_loss / len(train_loader)
		
		# Log metrics
		log_entry = {
			'timestamp': datetime.now().isoformat(),
			'model': 'ExpenseClassifier',
			'epoch': epoch + 1,
			'loss': avg_loss,
			'accuracy': accuracy / 100
		}
		with open(os.path.join(LOGS_DIR, 'training_metrics.jsonl'), 'a') as f:
			f.write(json.dumps(log_entry) + '\n')
		
		print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.4f}, Accuracy: {accuracy:.2f}%')
	
	# Save model and vocab
	torch.save(model.state_dict(), os.path.join(MODELS_DIR, 'expense_classifier.pt'))
	with open(os.path.join(MODELS_DIR, 'classifier_vocab.json'), 'w') as f:
		json.dump(vocab, f)
	with open(os.path.join(MODELS_DIR, 'classifier_categories.json'), 'w') as f:
		json.dump(CATEGORIES, f)
	
	print('Model saved!')


if __name__ == '__main__':
	train()

