"""
Configuration for Chat Service
"""
import os
from decouple import config

# OpenAI Configuration
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
OPENAI_MODEL = config('OPENAI_MODEL', default='gpt-3.5-turbo')  # or gpt-4o, gpt-4-turbo, gpt-4

# Groq Configuration (fallback)
GROQ_API_KEY = config('GROQ_API_KEY', default='')
GROQ_MODEL = config('GROQ_MODEL', default='llama-3.1-70b-versatile')  # or mixtral-8x7b-32768, gemma-7b-it

# Tavily Configuration (web search)
TAVILY_API_KEY = config('TAVILY_API_KEY', default='')

# Ollama Configuration (fallback)
OLLAMA_BASE_URL = config('OLLAMA_BASE_URL', default='http://localhost:11434')
OLLAMA_MODEL = config('OLLAMA_MODEL', default='llama3.2')  # or mistral, qwen2, etc.

# Financial Data Sources Configuration
FINANCIAL_SOURCES = {
    'sec_edgar': 'https://www.sec.gov/edgar/searchedgar/companysearch.html',
    'yahoo_finance': 'https://finance.yahoo.com',
    'bloomberg': 'https://www.bloomberg.com',
    'reuters': 'https://www.reuters.com',
    'financial_times': 'https://www.ft.com',
}

# JWT Configuration (shared with Django backend)
JWT_SECRET = config('JWT_SECRET', default='changeme-generate-secure-key-for-production')

# File Upload Configuration
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
UPLOAD_MAX_SIZE = config('UPLOAD_MAX_SIZE', default=10485760, cast=int)  # 10MB
ALLOWED_EXTENSIONS = config('ALLOWED_EXTENSIONS', default='csv,xlsx,pdf,png,jpg,jpeg,zip', cast=lambda v: [s.strip() for s in v.split(',')])

# Scam Classifier Configuration
SCAM_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'scam_classifier.pkl')

# CORS Configuration
CORS_ORIGINS = config('CORS_ORIGINS', default='http://localhost:3000,http://localhost:3001', cast=lambda v: [s.strip() for s in v.split(',')])

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.dirname(SCAM_MODEL_PATH), exist_ok=True)

