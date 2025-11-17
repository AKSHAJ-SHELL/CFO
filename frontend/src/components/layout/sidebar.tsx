'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  CreditCard,
  DollarSign,
  Activity,
  PiggyBank,
  BarChart3,
  Bell,
  LineChart,
  MessageSquare,
  FlaskConical,
  Settings,
  FileStack,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices & Collections', href: '/dashboard/invoices', icon: FileText },
  { name: 'Scenario Planning', href: '/dashboard/scenario-planner', icon: TrendingUp },
  { name: 'Bill Pay', href: '/dashboard/bill-pay', icon: CreditCard },
  { name: 'Profitability', href: '/dashboard/profitability', icon: DollarSign },
  { name: 'Health Score', href: '/dashboard/health-score', icon: Activity },
  { name: 'Cash Reserves', href: '/dashboard/cash-reserves', icon: PiggyBank },
  { name: 'Forecasting', href: '/dashboard/forecast', icon: BarChart3 },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { name: 'Analytics', href: '/dashboard/analytics', icon: LineChart },
  { name: 'AI CFO Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Model Playground', href: '/dashboard/playground', icon: FlaskConical },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Reports', href: '/dashboard/reports', icon: FileStack },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const NavContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="text-xl font-bold">FinPilot</span>
        </Link>
        <button 
          onClick={() => setIsOpen(false)} 
          className="lg:hidden"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
              onClick={() => setIsOpen(false)}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Demo User</p>
            <p className="text-xs text-gray-500 truncate">demo@finpilot.com</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
            <NavContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-white dark:bg-gray-900">
          <NavContent />
        </div>
      </div>
    </>
  );
}
