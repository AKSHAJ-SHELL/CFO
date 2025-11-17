'use client';

import { useState } from 'react';
import { FileStack, Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [reports] = useState([
    { id: '1', name: 'Monthly Financial Report', type: 'PDF', date: '2024-01-31', status: 'generated' },
    { id: '2', name: 'Q4 Profitability Analysis', type: 'Excel', date: '2024-01-15', status: 'scheduled' },
    { id: '3', name: 'Annual Summary', type: 'PDF', date: '2024-01-01', status: 'generated' },
  ]);

  return (
    <div className="min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Reports</h1>
            <p className="text-gray-400">Generate and schedule custom financial reports</p>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FileStack className="h-5 w-5" />
            Create Report
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <FileStack className="h-6 w-6 text-blue-400" />
                <span className={`px-2 py-1 rounded text-xs ${
                  report.status === 'generated' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {report.status}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{report.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {report.date}
                </span>
                <span>{report.type}</span>
              </div>
              <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

