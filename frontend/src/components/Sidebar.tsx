'use client';

import { X, FileText, TrendingUp, CreditCard, DollarSign, Activity, BarChart3, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Invoice Management', icon: FileText, href: '#invoices' },
  { name: 'Scenario Planning', icon: TrendingUp, href: '#scenarios' },
  { name: 'Bill Pay', icon: CreditCard, href: '#billpay' },
  { name: 'Profitability', icon: DollarSign, href: '#profitability' },
  { name: 'Forecasting', icon: BarChart3, href: '#forecasting' },
  { name: 'AI Chat', icon: MessageSquare, href: '#aichat' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500" />
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-600 bg-clip-text text-transparent">
                    FinPilot
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-indigo-50 to-sky-50 transition-all group"
                  >
                    <item.icon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                    <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-6 top-24 bottom-6 w-64 z-30">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-6 h-full overflow-y-auto"
        >
          <nav className="space-y-2">
            {navigation.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r from-indigo-50 to-sky-50 transition-all group"
              >
                <item.icon className="h-5 w-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
                <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">
                  {item.name}
                </span>
              </motion.a>
            ))}
          </nav>
        </motion.div>
      </aside>
    </>
  );
}

