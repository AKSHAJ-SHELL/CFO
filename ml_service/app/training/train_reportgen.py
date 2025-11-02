"""
Train report generator model
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

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.models.report_generator import ReportGenerator
from app.data.preprocess import ReportDataset, clean_text
from app.config import MODELS_DIR, DATA_DIR, LOGS_DIR


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
	"""Train the report generator"""
	print('Loading data...')
	df = pd.read_csv(os.path.join(DATA_DIR, 'reports.csv'))
	
	# Prepare metrics (normalized)
	metrics_data = []
	for _, row in df.iterrows():
		metrics_data.append([
			row['revenue'] / 50000,  # Normalize
			row['expenses'] / 50000,
			row['net'] / 50000,
			row['runway_days'] / 180,
			1.0 if row['sentiment'] == 'positive' else 0.0
		])
	
	# Build vocabulary
	print('Building vocabulary...')
	summaries = df['summary_text'].tolist()
	vocab = build_vocab(summaries)
	
	# Split train/test
	split_idx = int(len(metrics_data) * 0.8)
	train_metrics = metrics_data[:split_idx]
	train_summaries = summaries[:split_idx]
	test_metrics = metrics_data[split_idx:]
	test_summaries = summaries[split_idx:]
	
	# Create datasets (dataset handles tokenization and padding internally)
	max_len = 200
	train_dataset = ReportDataset(train_metrics, train_summaries, vocab, max_len=max_len)
	train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
	
	# Initialize model
	model = ReportGenerator(
		metric_dim=5,
		vocab_size=len(vocab),
		embed_dim=128,
		hidden_dim=256,
		max_len=max_len
	)
	
	# Training setup
	criterion = nn.CrossEntropyLoss(ignore_index=0)
	optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
	
	# Training loop
	num_epochs = 5
	device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
	model.to(device)
	
	print(f'Training on {device}...')
	
	for epoch in range(num_epochs):
		model.train()
		total_loss = 0
		
		for batch_metrics, batch_targets in train_loader:
			batch_metrics = batch_metrics.to(device)
			batch_targets = batch_targets.to(device)
			
			optimizer.zero_grad()
			outputs = model(batch_metrics, batch_targets)
			
			# Reshape for loss
			outputs = outputs.reshape(-1, outputs.size(-1))
			targets = batch_targets.reshape(-1)
			
			loss = criterion(outputs, targets)
			loss.backward()
			optimizer.step()
			
			total_loss += loss.item()
		
		avg_loss = total_loss / len(train_loader)
		perplexity = torch.exp(torch.tensor(avg_loss)).item()
		
		# Log metrics
		log_entry = {
			'timestamp': datetime.now().isoformat(),
			'model': 'ReportGenerator',
			'epoch': epoch + 1,
			'loss': avg_loss,
			'perplexity': perplexity
		}
		with open(os.path.join(LOGS_DIR, 'training_metrics.jsonl'), 'a') as f:
			f.write(json.dumps(log_entry) + '\n')
		
		print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.4f}, Perplexity: {perplexity:.2f}')
	
	# Save model and vocab
	torch.save(model.state_dict(), os.path.join(MODELS_DIR, 'report_generator.pt'))
	with open(os.path.join(MODELS_DIR, 'report_vocab.json'), 'w') as f:
		json.dump(vocab, f)
	
	print('Model saved!')


if __name__ == '__main__':
	train()

