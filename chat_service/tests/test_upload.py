"""
Tests for file upload and parsing
"""
import pytest
import os
import tempfile
import pandas as pd
from app.services.file_parser import FileParser, get_parser


def test_file_parser_initialization():
    """Test FileParser can be initialized"""
    parser = FileParser()
    assert parser is not None


def test_detect_file_type():
    """Test file type detection"""
    parser = FileParser()
    
    assert parser.detect_file_type("test.csv") == "transactions"
    assert parser.detect_file_type("test.xlsx") == "transactions"
    assert parser.detect_file_type("test.pdf") == "bank-statement"
    assert parser.detect_file_type("test.png") == "receipt"
    assert parser.detect_file_type("test.jpg") == "receipt"
    assert parser.detect_file_type("test.zip") == "batch"
    assert parser.detect_file_type("test.unknown") == "unknown"


def test_parse_csv():
    """Test CSV parsing"""
    parser = FileParser()
    
    # Create temporary CSV file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write("date,amount,description\n")
        f.write("2025-01-01,100.00,Test transaction\n")
        f.write("2025-01-02,200.00,Another transaction\n")
        temp_path = f.name
    
    try:
        result = parser.parse_csv(temp_path)
        assert result['success'] is True
        assert result['total_records'] == 2
        assert len(result['records']) == 2
        assert 'date' in result['columns']
        assert 'amount' in result['columns']
    finally:
        os.unlink(temp_path)


def test_parse_xlsx():
    """Test XLSX parsing"""
    parser = FileParser()
    
    # Create temporary XLSX file
    df = pd.DataFrame({
        'date': ['2025-01-01', '2025-01-02'],
        'amount': [100.00, 200.00],
        'description': ['Test', 'Another']
    })
    
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as f:
        df.to_excel(f.name, index=False)
        temp_path = f.name
    
    try:
        result = parser.parse_xlsx(temp_path)
        assert result['success'] is True
        assert result['total_records'] == 2
    finally:
        os.unlink(temp_path)


def test_get_parser_singleton():
    """Test get_parser returns singleton instance"""
    parser1 = get_parser()
    parser2 = get_parser()
    assert parser1 is parser2

