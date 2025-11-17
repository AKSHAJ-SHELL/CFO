'use client';

import { useState } from 'react';
import { Brain, Upload, Play, TrendingUp, BarChart3, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PlaygroundPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [training, setTraining] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map(f => f.name);
      setUploadedFiles(files);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setTimeout(() => {
      setTraining(false);
      setModelTrained(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-text-muted mb-4">
          <Link href="/dashboard" className="hover:text-primary-blue">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/models" className="hover:text-primary-blue">Models</Link>
          <span>/</span>
          <span className="text-text-dark">Model Playground</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Model Playground</h1>
            <p className="text-text-muted">
              Train and test your own financial models with custom datasets
            </p>
          </div>
          <Link
            href="/dashboard/models"
            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-background-main transition-colors"
          >
            Back to Models
          </Link>
        </div>

        {/* Upload Section */}
        <div className="card-base">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-blue/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary-blue" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-dark">Upload Dataset</h3>
              <p className="text-sm text-text-muted">Upload CSV files with financial data</p>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".csv,.xlsx"
              multiple
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-text-dark font-medium mb-2">Click to upload or drag and drop</p>
              <p className="text-sm text-text-muted">CSV, XLSX files up to 10MB</p>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-text-dark">Uploaded Files:</p>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-sm text-text-muted">
                  <FileText className="h-4 w-4" />
                  <span>{file}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training Section */}
        <div className="card-base">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary-green/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-green" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-dark">Train Model</h3>
              <p className="text-sm text-text-muted">Train your financial prediction model</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="text-sm font-medium text-text-dark block mb-2">Model Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded">
                  <option>Linear Regression</option>
                  <option>Random Forest</option>
                  <option>Neural Network</option>
                </select>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="text-sm font-medium text-text-dark block mb-2">Training Split</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded">
                  <option>80/20</option>
                  <option>70/30</option>
                  <option>60/40</option>
                </select>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <label className="text-sm font-medium text-text-dark block mb-2">Epochs</label>
                <input type="number" defaultValue={100} className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>
            </div>

            <button
              onClick={handleTrain}
              disabled={uploadedFiles.length === 0 || training}
              className="w-full px-6 py-3 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {training ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Training...</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  <span>Start Training</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {modelTrained && (
          <div className="card-base">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent-violet/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-accent-violet" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">Model Performance</h3>
                <p className="text-sm text-text-muted">Training completed successfully</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-text-muted mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-text-dark">87.3%</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-text-muted mb-1">R² Score</p>
                <p className="text-2xl font-bold text-text-dark">0.92</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-text-muted mb-1">RMSE</p>
                <p className="text-2xl font-bold text-text-dark">12.4</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-text-dark mb-2">Confusion Matrix</h4>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="text-center p-2 bg-green-100 rounded">TP: 142</div>
                <div className="text-center p-2 bg-red-100 rounded">FP: 8</div>
                <div className="text-center p-2 bg-red-100 rounded">FN: 12</div>
                <div className="text-center p-2 bg-green-100 rounded">TN: 138</div>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Section */}
        {modelTrained && (
          <div className="card-base">
            <h3 className="text-xl font-semibold text-text-dark mb-4">Make Predictions</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-dark block mb-2">Input Features</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    rows={4}
                    placeholder="Enter feature values (comma-separated)"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-dark block mb-2">Prediction Result</label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50">
                    <p className="text-text-muted">Click "Predict" to see results</p>
                  </div>
                </div>
              </div>
              <button className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90">
                Predict
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

