'use client';

import { useState, useEffect } from 'react';
import { getSessionLog } from '@/lib/mockApi';
import type { SessionLogEntry } from '@/lib/types';

/**
 * SessionLogger component for displaying session action logs
 */
export default function SessionLogger() {
  const [logs, setLogs] = useState<SessionLogEntry[]>([]);

  useEffect(() => {
    const loadLogs = () => {
      setLogs(getSessionLog());
    };
    loadLogs();
    
    // Refresh every 2 seconds
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-h-64 overflow-y-auto space-y-2">
      {logs.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-4">No actions logged yet</p>
      ) : (
        logs.map((log) => (
          <div
            key={log.id}
            className="text-xs p-2 bg-background-main rounded border border-gray-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-text-dark">{log.action}</span>
              <span className="text-text-muted">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
            {log.details && (
              <pre className="text-xs text-text-muted overflow-x-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            )}
          </div>
        ))
      )}
    </div>
  );
}

