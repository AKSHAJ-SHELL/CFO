'use client';

import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Trash2 } from 'lucide-react';
import { getFeatureStatus, getIntegrationStatus, getSessionLog, clearSessionLog, seedDemoData } from '@/lib/mockApi';
import type { FeatureStatus, IntegrationStatusInfo, SessionLogEntry } from '@/lib/types';
import BetaFeatureToggle from './BetaFeatureToggle';
import SessionLogger from './SessionLogger';
import FileUpload from './FileUpload';

/**
 * BetaToolbar component for beta testing dashboard
 */
export default function BetaToolbar() {
  const [featureStatuses, setFeatureStatuses] = useState<FeatureStatus[]>([]);
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatusInfo[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = () => {
    setFeatureStatuses(getFeatureStatus());
    setIntegrationStatuses(getIntegrationStatus());
  };

  const handleSeedDemo = () => {
    seedDemoData();
    loadStatuses();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-primary-blue text-white p-4 rounded-full shadow-lg hover:bg-primary-blue/90 transition-all"
        aria-label="Toggle beta toolbar"
        aria-expanded={isExpanded}
      >
        <Settings className="h-6 w-6" />
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-20 right-0 w-96 bg-background-white rounded-lg shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-dark">Beta Testing Tools</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-text-muted hover:text-text-dark"
                aria-label="Close toolbar"
              >
                ×
              </button>
            </div>

            {/* Seed Demo Data */}
            <div>
              <button
                onClick={handleSeedDemo}
                className="w-full px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-primary-green/90 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Seed Demo Data
              </button>
            </div>

            {/* Feature Toggles */}
            <div>
              <h4 className="text-sm font-semibold text-text-dark mb-3">Feature Toggles</h4>
              <div className="space-y-2">
                {featureStatuses.map((status) => (
                  <BetaFeatureToggle
                    key={status.featureId}
                    featureId={status.featureId}
                    enabled={status.enabled}
                    onToggle={(enabled) => {
                      const updated = featureStatuses.map(s =>
                        s.featureId === status.featureId ? { ...s, enabled } : s
                      );
                      setFeatureStatuses(updated);
                      // Update localStorage
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('finpilot_feature_status', JSON.stringify(updated));
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Integration Status */}
            <div>
              <h4 className="text-sm font-semibold text-text-dark mb-3">Integrations</h4>
              <div className="space-y-2">
                {integrationStatuses.map((status) => (
                  <div key={status.integrationId} className="flex items-center justify-between p-2 bg-background-main rounded">
                    <span className="text-sm text-text-dark capitalize">{status.integrationId}</span>
                    <span className={`text-xs px-2 py-1 rounded ${status.mockConnected ? 'bg-status-success/20 text-status-success' : 'bg-gray-200 text-gray-600'}`}>
                      {status.mockConnected ? 'Connected' : 'Available'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <h4 className="text-sm font-semibold text-text-dark mb-3">File Upload</h4>
              <FileUpload />
            </div>

            {/* Session Logger */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-text-dark">Session Log</h4>
                <button
                  onClick={clearSessionLog}
                  className="text-xs text-text-muted hover:text-status-error"
                  aria-label="Clear session log"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <SessionLogger />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

