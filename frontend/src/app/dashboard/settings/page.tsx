'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, User, Bell, Shield, Plug, ArrowLeft } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Settings & Configuration' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Settings</h1>
            <p className="text-text-muted">Configure your FinPilot account and preferences</p>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="card-base">
            <div className="flex items-center gap-4 mb-4">
              <User className="h-6 w-6 text-primary-blue" />
              <h2 className="text-xl font-bold text-text-dark">Account</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="demo@finpilot.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-dark"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Organization Name</label>
                <input
                  type="text"
                  defaultValue="Demo Company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-text-dark"
                />
              </div>
            </div>
          </div>

          <div className="card-base">
            <div className="flex items-center gap-4 mb-4">
              <Bell className="h-6 w-6 text-accent-violet" />
              <h2 className="text-xl font-bold text-text-dark">Notifications</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-text-dark">Email notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-text-dark">Alert notifications</span>
              </label>
            </div>
          </div>

          <div className="card-base">
            <div className="flex items-center gap-4 mb-4">
              <Plug className="h-6 w-6 text-primary-green" />
              <h2 className="text-xl font-bold text-text-dark">Integrations</h2>
            </div>
            <p className="text-text-muted text-sm">Manage your connected services and APIs</p>
          </div>
        </div>
      </div>
    </div>
  );
}

