"""
FastAPI main application
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
import os
from app.config import ML_INTERNAL_TOKEN
from app.inference.classifier_infer import ClassifierInference
from app.inference.report_infer import ReportInference
from app.schemas.classifier_schema import ClassifierRequest, ClassifierResponse
from app.schemas.report_schema import ReportRequest, ReportResponse

app = FastAPI(title='FinPilot ML Service', version='1.0.0')

# CORS
app.add_middleware(
	CORSMiddleware,
	allow_origins=['*'],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)

# Security
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
	"""Verify internal token"""
	if credentials.credentials != ML_INTERNAL_TOKEN:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail='Invalid authentication token'
		)
	return credentials.credentials


# Initialize inference engines
classifier_infer = ClassifierInference()
report_infer = ReportInference()


@app.get('/health')
def health():
	"""Health check endpoint"""
	return {'status': 'healthy', 'service': 'ml_service'}


@app.post('/classify', response_model=ClassifierResponse)
def classify(request: ClassifierRequest, token: str = Depends(verify_token)):
	"""Classify transaction"""
	try:
		result = classifier_infer.predict(request)
		return result
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(e)
		)


@app.post('/generate_report', response_model=ReportResponse)
def generate_report(request: ReportRequest, token: str = Depends(verify_token)):
	"""Generate financial report summary"""
	try:
		result = report_infer.generate(request)
		return result
	except Exception as e:
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=str(e)
		)


@app.get('/status')
def get_status():
	"""Get service status"""
	return {
		'classifier_loaded': classifier_infer.model is not None,
		'report_generator_loaded': report_infer.model is not None,
	}

