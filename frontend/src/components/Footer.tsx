'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                FinPilot
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              Intelligent financial management for modern businesses.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#invoices" className="hover:text-indigo-600 transition-colors">Invoice Management</a></li>
              <li><a href="#scenarios" className="hover:text-indigo-600 transition-colors">Scenario Planning</a></li>
              <li><a href="#profitability" className="hover:text-indigo-600 transition-colors">Profitability</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} FinPilot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

