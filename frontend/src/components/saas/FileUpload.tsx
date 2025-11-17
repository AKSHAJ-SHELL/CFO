'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadFile, getUploadedFiles, deleteUploadedFile, parseFile } from '@/lib/mockApi';
import type { UploadedFile, FileType } from '@/lib/types';

/**
 * FileUpload component with drag-and-drop support
 */
export default function FileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [parsingFileId, setParsingFileId] = useState<string | null>(null);

  const loadFiles = useCallback(() => {
    setUploadedFiles(getUploadedFiles());
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        await uploadFile(file);
      }
      loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [loadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'application/zip': ['.zip'],
    },
  });

  const handleDelete = (fileId: string) => {
    deleteUploadedFile(fileId);
    loadFiles();
  };

  const handleParse = async (fileId: string, parseType: 'transactions' | 'forecast' | 'bills') => {
    setParsingFileId(fileId);
    try {
      await parseFile(fileId, parseType);
      loadFiles();
    } catch (error) {
      console.error('Parse error:', error);
    } finally {
      setParsingFileId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-blue bg-primary-blue/5'
            : 'border-gray-300 hover:border-primary-blue/50'
        }`}
        role="button"
        tabIndex={0}
        aria-label="File upload dropzone"
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-primary-blue font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-text-dark font-medium mb-2">
              Drag and drop files here, or click to select
            </p>
            <p className="text-sm text-text-muted">
              Supports CSV, XLSX, PDF, JSON, PNG, JPG, ZIP
            </p>
            <p className="text-xs text-text-muted mt-2">
              Demo only - files stored locally in browser
            </p>
          </>
        )}
      </div>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-dark">Uploaded Files</h3>
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-base flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 flex-grow">
                <File className="h-8 w-8 text-primary-blue" />
                <div>
                  <p className="font-medium text-text-dark">{file.name}</p>
                  <p className="text-sm text-text-muted">
                    {file.type} • {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleParse(file.id, 'transactions')}
                  disabled={parsingFileId === file.id}
                  className="px-3 py-1 text-sm bg-primary-blue text-white rounded hover:bg-primary-blue/90 disabled:opacity-50"
                >
                  {parsingFileId === file.id ? 'Parsing...' : 'Parse'}
                </button>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-2 text-text-muted hover:text-status-error hover:bg-background-main rounded"
                  aria-label={`Delete ${file.name}`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="text-center text-text-muted">
          <p>Uploading files...</p>
        </div>
      )}
    </div>
  );
}

