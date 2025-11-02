"""
Configuration for ML service
"""
import os
from decouple import config

ML_INTERNAL_TOKEN = config('ML_INTERNAL_TOKEN', default='secure_local_token_change_in_production')
MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'synthetic')
LOGS_DIR = os.path.join(os.path.dirname(__file__), 'training', 'logs')

# Ensure directories exist
os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

