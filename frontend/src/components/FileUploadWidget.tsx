'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UploadResult {
  uploadId: string;
  filename: string;
  detectedType: string;
  previewRecords: number;
}

interface ParseResult {
  taskId: string;
  status: string;
  records?: any[];
  message?: string;
}

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8081';
const ALLOWED_TYPES = ['csv', 'xlsx', 'xls', 'pdf', 'png', 'jpg', 'jpeg', 'zip'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function FileUploadWidget() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_TYPES.includes(ext)) {
      return `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`;
    }
    if (file.size > MAX_SIZE) {
      return `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadResult(null);
    setParseResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${CHAT_SERVICE_URL}/api/upload/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data: UploadResult = await response.json();
      setUploadResult(data);

      // Automatically parse the file
      await handleParse(data.uploadId);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleParse = async (uploadId: string) => {
    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/upload/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uploadId }),
      });

      if (!response.ok) {
        throw new Error('Parsing failed');
      }

      const data: ParseResult = await response.json();
      setParseResult(data);
    } catch (err: any) {
      setError(err.message || 'Parsing failed');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const reset = () => {
    setUploadResult(null);
    setParseResult(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 bg-gray-800/50'
        }`}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={ALLOWED_TYPES.map(t => `.${t}`).join(',')}
          onChange={handleFileInput}
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-4"
        >
          <Upload className={`h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-lg font-semibold text-white">
              {uploading ? 'Uploading...' : 'Drag and drop a file here'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Supported: CSV, XLSX, PDF, PNG, JPG, ZIP (max 10MB)
            </p>
          </div>
        </label>
      </div>

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center gap-2 text-blue-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Uploading and parsing file...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-semibold text-white">{uploadResult.filename}</p>
                <p className="text-sm text-gray-400">
                  Type: {uploadResult.detectedType} • {uploadResult.previewRecords} records
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Parse Result */}
          {parseResult && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              {parseResult.status === 'completed' && parseResult.records ? (
                <div>
                  <p className="text-sm font-semibold text-white mb-2">
                    Parsed Records ({parseResult.records.length}):
                  </p>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-700">
                          {Object.keys(parseResult.records[0] || {}).map((key) => (
                            <th key={key} className="p-2">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.records.slice(0, 5).map((record, idx) => (
                          <tr key={idx} className="border-b border-gray-700/50">
                            {Object.values(record).map((value: any, valIdx) => (
                              <td key={valIdx} className="p-2 text-gray-300">
                                {String(value).substring(0, 50)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parseResult.records.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Showing first 5 of {parseResult.records.length} records
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{parseResult.message || 'Parsing...'}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

