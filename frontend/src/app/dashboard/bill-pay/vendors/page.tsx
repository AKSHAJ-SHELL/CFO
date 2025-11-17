'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Plus, Edit, Trash2, ArrowLeft, Mail, FileText } from 'lucide-react';
import Breadcrumb from '@/components/saas/Breadcrumb';
import { apiClient } from '@/lib/api';

interface Vendor {
  id: string;
  name: string;
  email?: string;
  payment_terms?: string;
  created_at?: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', payment_terms: 'Net 30' });

  const getOrgId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('org_id') || 'demo-org-id';
    }
    return 'demo-org-id';
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const orgId = getOrgId();
      const data = await apiClient.getVendors(orgId);
      if (Array.isArray(data)) {
        setVendors(data);
      } else {
        // Fallback mock data
        setVendors([
          { id: '1', name: 'Office Supplies Co', email: 'contact@officesupplies.com', payment_terms: 'Net 30' },
          { id: '2', name: 'Cloud Services Inc', email: 'billing@cloudservices.com', payment_terms: 'Net 15' },
          { id: '3', name: 'Utilities Provider', email: 'accounts@utilities.com', payment_terms: 'Net 30' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      setVendors([
        { id: '1', name: 'Office Supplies Co', email: 'contact@officesupplies.com', payment_terms: 'Net 30' },
        { id: '2', name: 'Cloud Services Inc', email: 'billing@cloudservices.com', payment_terms: 'Net 15' },
        { id: '3', name: 'Utilities Provider', email: 'accounts@utilities.com', payment_terms: 'Net 30' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVendor = async () => {
    try {
      const orgId = getOrgId();
      const created = await apiClient.createVendor(orgId, vendorForm);
      setVendors([...vendors, created]);
      setShowCreateModal(false);
      setVendorForm({ name: '', email: '', payment_terms: 'Net 30' });
    } catch (error) {
      console.error('Failed to create vendor:', error);
      alert('Failed to create vendor. Please try again.');
    }
  };

  const handleUpdateVendor = async () => {
    if (!editingVendor) return;
    
    try {
      const orgId = getOrgId();
      const updated = await apiClient.updateVendor(orgId, editingVendor.id, vendorForm);
      setVendors(vendors.map(v => v.id === editingVendor.id ? updated : v));
      setEditingVendor(null);
      setVendorForm({ name: '', email: '', payment_terms: 'Net 30' });
    } catch (error) {
      console.error('Failed to update vendor:', error);
      alert('Failed to update vendor. Please try again.');
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const orgId = getOrgId();
      await apiClient.deleteVendor(orgId, vendorId);
      setVendors(vendors.filter(v => v.id !== vendorId));
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Failed to delete vendor. Please try again.');
    }
  };

  const openEditModal = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setVendorForm({ name: vendor.name, email: vendor.email || '', payment_terms: vendor.payment_terms || 'Net 30' });
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Automation', href: '/dashboard/automation' },
          { label: 'Bill Pay', href: '/dashboard/bill-pay' },
          { label: 'Vendors' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Vendor Management</h1>
            <p className="text-text-muted">Manage vendor relationships and payment history</p>
          </div>
          <div className="flex space-x-2">
            <Link
              href="/dashboard/bill-pay"
              className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <button
              onClick={() => {
                setEditingVendor(null);
                setVendorForm({ name: '', email: '', payment_terms: 'Net 30' });
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90"
            >
              <Plus className="h-5 w-5" />
              <span>New Vendor</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
            <p className="mt-4 text-text-muted">Loading vendors...</p>
          </div>
        ) : (
          <div className="card-base">
            <div className="space-y-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-blue/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-dark">{vendor.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-text-muted mt-1">
                        {vendor.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{vendor.email}</span>
                          </span>
                        )}
                        {vendor.payment_terms && (
                          <span className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{vendor.payment_terms}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="p-2 text-status-error hover:bg-status-error/10 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create/Edit Vendor Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-text-dark mb-4">
                {editingVendor ? 'Edit Vendor' : 'Create New Vendor'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Vendor Name</label>
                  <input
                    type="text"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="e.g., Office Supplies Co"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    placeholder="vendor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Payment Terms</label>
                  <select
                    value={vendorForm.payment_terms}
                    onChange={(e) => setVendorForm({ ...vendorForm, payment_terms: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                  >
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Net 60">Net 60</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingVendor(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingVendor ? handleUpdateVendor : handleCreateVendor}
                  disabled={!vendorForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingVendor ? 'Update' : 'Create'} Vendor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

