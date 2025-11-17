'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Reusable Breadcrumb component for dashboard navigation
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-text-muted mb-4" aria-label="Breadcrumb">
      <Link 
        href="/dashboard" 
        className="hover:text-primary-blue transition-colors flex items-center"
        aria-label="Dashboard"
      >
        <Home className="h-4 w-4 mr-1" />
        Dashboard
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-text-muted" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-primary-blue transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-dark font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

