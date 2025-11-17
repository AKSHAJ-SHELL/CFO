"""
File parsing service for CSV, XLSX, PDF, and OCR
"""
import os
import uuid
import pandas as pd
import PyPDF2
import pdfplumber
from typing import Dict, Any, List, Optional
from PIL import Image
import pytesseract
import easyocr
from app.config import UPLOAD_DIR


class FileParser:
    def __init__(self):
        self.reader = None  # Lazy load EasyOCR

    def _get_easyocr_reader(self):
        """Lazy load EasyOCR reader"""
        if self.reader is None:
            self.reader = easyocr.Reader(['en'])
        return self.reader

    def detect_file_type(self, filename: str) -> str:
        """Detect file type from extension"""
        ext = filename.lower().split('.')[-1]
        type_map = {
            'csv': 'transactions',
            'xlsx': 'transactions',
            'xls': 'transactions',
            'pdf': 'bank-statement',
            'png': 'receipt',
            'jpg': 'receipt',
            'jpeg': 'receipt',
            'zip': 'batch'
        }
        return type_map.get(ext, 'unknown')

    def parse_csv(self, file_path: str) -> Dict[str, Any]:
        """Parse CSV file"""
        try:
            df = pd.read_csv(file_path)
            records = df.to_dict('records')
            return {
                'success': True,
                'records': records[:10],  # Preview first 10
                'total_records': len(records),
                'columns': list(df.columns)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'records': [],
                'total_records': 0,
                'columns': []
            }

    def parse_xlsx(self, file_path: str) -> Dict[str, Any]:
        """Parse XLSX file"""
        try:
            df = pd.read_excel(file_path)
            records = df.to_dict('records')
            return {
                'success': True,
                'records': records[:10],  # Preview first 10
                'total_records': len(records),
                'columns': list(df.columns)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'records': [],
                'total_records': 0,
                'columns': []
            }

    def parse_pdf(self, file_path: str) -> Dict[str, Any]:
        """Parse PDF file - try pdfplumber first, fallback to PyPDF2"""
        try:
            # Try pdfplumber first (better for tables)
            with pdfplumber.open(file_path) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                
                if text_parts:
                    full_text = '\n'.join(text_parts)
                    return {
                        'success': True,
                        'text': full_text,
                        'pages': len(pdf.pages),
                        'preview': full_text[:500]
                    }
        except:
            pass

        # Fallback to PyPDF2
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text_parts = []
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
                
                full_text = '\n'.join(text_parts)
                return {
                    'success': True,
                    'text': full_text,
                    'pages': len(pdf_reader.pages),
                    'preview': full_text[:500]
                }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'pages': 0,
                'preview': ''
            }

    def parse_image_ocr(self, file_path: str, use_easyocr: bool = True) -> Dict[str, Any]:
        """Parse image using OCR"""
        try:
            if use_easyocr:
                reader = self._get_easyocr_reader()
                results = reader.readtext(file_path)
                text_parts = [result[1] for result in results]
                full_text = '\n'.join(text_parts)
            else:
                # Fallback to Tesseract
                image = Image.open(file_path)
                full_text = pytesseract.image_to_string(image)

            return {
                'success': True,
                'text': full_text,
                'preview': full_text[:500]
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'text': '',
                'preview': ''
            }

    def parse_file(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Parse file based on type"""
        file_type = self.detect_file_type(filename)
        
        if file_type == 'transactions':
            ext = filename.lower().split('.')[-1]
            if ext == 'csv':
                return self.parse_csv(file_path)
            elif ext in ['xlsx', 'xls']:
                return self.parse_xlsx(file_path)
        elif file_type == 'bank-statement':
            return self.parse_pdf(file_path)
        elif file_type == 'receipt':
            return self.parse_image_ocr(file_path)
        else:
            return {
                'success': False,
                'error': f'Unsupported file type: {file_type}',
                'records': [],
                'total_records': 0
            }


# Singleton instance
_parser_instance: Optional[FileParser] = None


def get_parser() -> FileParser:
    """Get or create FileParser instance"""
    global _parser_instance
    if _parser_instance is None:
        _parser_instance = FileParser()
    return _parser_instance

