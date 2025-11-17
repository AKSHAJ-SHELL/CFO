'use client';

import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2, Shield } from 'lucide-react';

interface ScamResult {
  score: number;
  is_scam: boolean;
  reason: string;
}

const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:8081';

interface ScamCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

export default function ScamCheckModal({ isOpen, onClose, initialText = '' }: ScamCheckModalProps) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<ScamResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('Please enter some text to check');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${CHAT_SERVICE_URL}/api/scam/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Scam check failed');
      }

      const data: ScamResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to check for scams');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setText('');
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-red-500';
    if (score >= 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 0.7) return 'bg-red-500/20 border-red-500';
    if (score >= 0.4) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-green-500/20 border-green-500';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">Scam Detection</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter text to check (invoice, email, message, etc.)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the text you want to check for scam indicators..."
              className="w-full h-40 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${getScoreBg(result.score)}`}>
              <div className="flex items-start gap-3">
                {result.is_scam ? (
                  <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {result.is_scam ? 'Scam Detected' : 'Likely Safe'}
                    </h3>
                    <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                      {(result.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-3">{result.reason}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        result.score >= 0.7
                          ? 'bg-red-500'
                          : result.score >= 0.4
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${result.score * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Score: {result.score.toFixed(3)} (0 = Safe, 1 = Scam)
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCheck}
              disabled={loading || !text.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Check for Scams</span>
                </>
              )}
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

