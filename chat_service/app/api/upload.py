"""
File upload endpoints
"""
import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from app.config import UPLOAD_DIR, UPLOAD_MAX_SIZE, ALLOWED_EXTENSIONS
from app.services.file_parser import get_parser
from app.schemas.upload import UploadResponse, ParseRequest, ParseResponse

router = APIRouter()

# In-memory storage for uploads (in production, use database)
upload_storage: Dict[str, Dict[str, Any]] = {}


@router.post("/", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a file and return metadata
    """
    # Validate file extension
    file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generate upload ID
    upload_id = str(uuid.uuid4())
    
    # Save file
    file_path = os.path.join(UPLOAD_DIR, f"{upload_id}_{file.filename}")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    content = await file.read()
    
    # Validate file size
    if len(content) > UPLOAD_MAX_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {UPLOAD_MAX_SIZE / 1024 / 1024}MB"
        )
    
    with open(file_path, 'wb') as f:
        f.write(content)

    # Detect file type
    parser = get_parser()
    detected_type = parser.detect_file_type(file.filename)

    # Parse file for preview
    parse_result = parser.parse_file(file_path, file.filename)
    
    preview_records = 0
    if 'total_records' in parse_result:
        preview_records = parse_result.get('total_records', 0)
    elif 'text' in parse_result and parse_result.get('success'):
        preview_records = 1  # Text-based files count as 1 record

    # Store upload metadata
    upload_storage[upload_id] = {
        'filename': file.filename,
        'file_path': file_path,
        'detected_type': detected_type,
        'parse_result': parse_result
    }

    return UploadResponse(
        uploadId=upload_id,
        filename=file.filename,
        detectedType=detected_type,
        previewRecords=preview_records
    )


@router.post("/parse", response_model=ParseResponse)
async def parse_file(request: ParseRequest):
    """
    Parse uploaded file with optional column mapping
    """
    if request.uploadId not in upload_storage:
        raise HTTPException(status_code=404, detail="Upload not found")

    upload_info = upload_storage[request.uploadId]
    file_path = upload_info['file_path']
    filename = upload_info['filename']
    
    parser = get_parser()
    parse_result = parser.parse_file(file_path, filename)

    if not parse_result.get('success'):
        return ParseResponse(
            taskId=str(uuid.uuid4()),
            status="failed",
            message=parse_result.get('error', 'Parsing failed')
        )

    # Apply column mapping if provided (for CSV/XLSX)
    records = parse_result.get('records', [])
    if request.mapping and records:
        mapped_records = []
        for record in records:
            mapped_record = {}
            for new_key, old_key in request.mapping.items():
                if old_key in record:
                    mapped_record[new_key] = record[old_key]
            mapped_records.append(mapped_record)
        records = mapped_records

    return ParseResponse(
        taskId=str(uuid.uuid4()),
        status="completed",
        records=records,
        message=f"Successfully parsed {len(records)} records"
    )


@router.get("/{upload_id}")
async def get_upload_info(upload_id: str):
    """Get upload information"""
    if upload_id not in upload_storage:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    upload_info = upload_storage[upload_id]
    return {
        "uploadId": upload_id,
        "filename": upload_info['filename'],
        "detectedType": upload_info['detected_type'],
        "parseResult": upload_info['parse_result']
    }

