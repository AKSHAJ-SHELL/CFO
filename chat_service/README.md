# FinPilot Chat Service

FastAPI microservice for AI chatbot, file upload/parsing, and scam detection.

## Features

- **WebSocket Streaming Chat**: Real-time chat with Ollama LLM integration
- **File Upload & Parsing**: Support for CSV, XLSX, PDF, and image OCR
- **Scam Detection**: ML-based scam classifier with heuristic rules

## Setup

### Prerequisites

- Python 3.11+
- Ollama (for LLM chat) - optional, falls back to mock responses if unavailable
- Docker (for containerized deployment)

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (create `.env` file):
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
JWT_SECRET=your_jwt_secret
UPLOAD_MAX_SIZE=10485760
ALLOWED_EXTENSIONS=csv,xlsx,pdf,png,jpg,jpeg,zip
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

3. Run the service:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8081 --reload
```

### Docker

```bash
docker-compose up chat_service
```

## API Endpoints

### WebSocket Chat
- **Endpoint**: `ws://localhost:8081/ws/chat`
- **Protocol**: WebSocket
- **Send**: `{"text": "user message", "conv_id": "optional"}`
- **Receive**: `{"type": "chunk", "text": "..."}` then `{"type": "done"}`

### File Upload
- **POST** `/api/upload/`: Upload a file
- **POST** `/api/upload/parse`: Parse uploaded file
- **GET** `/api/upload/{upload_id}`: Get upload info

### Scam Detection
- **POST** `/api/scam/check`: Check text for scam indicators
  - Request: `{"text": "text to check"}`
  - Response: `{"score": 0.85, "is_scam": true, "reason": "..."}`

### Health Check
- **GET** `/health`: Service health status

## Testing

Run tests:
```bash
pytest
```

## Architecture

- `app/main.py`: FastAPI application entry point
- `app/api/`: API route handlers
- `app/services/`: Business logic (chat agent, file parser, scam classifier)
- `app/schemas/`: Pydantic models for request/response validation
- `app/config.py`: Configuration management

## Notes

- Ollama must be running for real LLM chat. If unavailable, service falls back to mock responses.
- File uploads are stored in `uploads/` directory (or Docker volume).
- Scam classifier model is trained on synthetic data and saved to `models/scam_classifier.pkl`.

