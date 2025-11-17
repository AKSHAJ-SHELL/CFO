'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, FileText, Workflow, Upload, CheckCircle, ArrowLeft, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Breadcrumb from '@/components/saas/Breadcrumb';
import { apiClient } from '@/lib/api';

interface Bill {
  id: string;
  vendor_name: string;
  vendor?: { name: string };
  total_amount: number;
  due_date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
}

interface Vendor {
  id: string;
  name: string;
  email?: string;
  payment_terms?: string;
}

export default function BillPayPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', email: '', payment_terms: 'Net 30' });

  const getOrgId = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('org_id') || 'demo-org-id';
    }
    return 'demo-org-id';
  };

  useEffect(() => {
    loadBillsAndVendors();
  }, []);

  const loadBillsAndVendors = async () => {
    try {
      setLoading(true);
      const orgId = getOrgId();
      const [billsData, vendorsData] = await Promise.all([
        apiClient.getBills(orgId),
        apiClient.getVendors(orgId),
      ]);

      if (Array.isArray(billsData)) {
        setBills(billsData);
      } else {
        // Fallback mock data
        setBills([
          { id: '1', vendor_name: 'Office Supplies Co', total_amount: 450, due_date: '2024-02-15', status: 'pending' },
          { id: '2', vendor_name: 'Cloud Services Inc', total_amount: 1200, due_date: '2024-02-20', status: 'approved' },
          { id: '3', vendor_name: 'Utilities', total_amount: 380, due_date: '2024-02-18', status: 'paid' },
        ]);
      }

      if (Array.isArray(vendorsData)) {
        setVendors(vendorsData);
      }
    } catch (error) {
      console.error('Failed to load bills/vendors:', error);
      // Keep mock data as fallback
      setBills([
        { id: '1', vendor_name: 'Office Supplies Co', total_amount: 450, due_date: '2024-02-15', status: 'pending' },
        { id: '2', vendor_name: 'Cloud Services Inc', total_amount: 1200, due_date: '2024-02-20', status: 'approved' },
        { id: '3', vendor_name: 'Utilities', total_amount: 380, due_date: '2024-02-18', status: 'paid' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      const orgId = getOrgId();
      for (const file of acceptedFiles) {
        const result = await apiClient.uploadBill(orgId, file);
        // Reload bills after upload
        loadBillsAndVendors();
      }
    } catch (error) {
      console.error('Bill upload error:', error);
      alert('Failed to upload bill. Please try again.');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
  });

  const handleApproveBill = async (billId: string) => {
    try {
      const orgId = getOrgId();
      await apiClient.approveBill(orgId, billId, {});
      loadBillsAndVendors();
    } catch (error) {
      console.error('Failed to approve bill:', error);
      alert('Failed to approve bill. Please try again.');
    }
  };

  const handleRejectBill = async (billId: string) => {
    try {
      const orgId = getOrgId();
      await apiClient.rejectBill(orgId, billId, { reason: 'Rejected by user' });
      loadBillsAndVendors();
    } catch (error) {
      console.error('Failed to reject bill:', error);
      alert('Failed to reject bill. Please try again.');
    }
  };

  const handleCreateVendor = async () => {
    try {
      const orgId = getOrgId();
      await apiClient.createVendor(orgId, newVendor);
      setShowVendorModal(false);
      setNewVendor({ name: '', email: '', payment_terms: 'Net 30' });
      loadBillsAndVendors();
    } catch (error) {
      console.error('Failed to create vendor:', error);
      alert('Failed to create vendor. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background-main py-12 px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb items={[
          { label: 'Automation', href: '/dashboard/automation' },
          { label: 'Bill Pay Automation' },
        ]} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-dark mb-2">Bill Pay Automation</h1>
            <p className="text-text-muted">Automate bill processing with OCR and approval workflows</p>
          </div>
          <Link
            href="/dashboard/automation"
            className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto"></div>
            <p className="mt-4 text-text-muted">Loading bills...</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              <Link href="/dashboard/bill-pay/vendors" className="card-base hover:shadow-lg transition-all cursor-pointer group">
                <Building2 className="h-8 w-8 text-primary-blue mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold text-text-dark mb-2">Vendors</h3>
                <p className="text-text-muted text-sm">Manage vendor relationships and payment history</p>
                <p className="text-sm text-primary-blue mt-2">View all vendors →</p>
              </Link>
              <div className="card-base">
                <FileText className="h-8 w-8 text-accent-violet mb-4" />
                <h3 className="text-xl font-bold text-text-dark mb-2">Bills</h3>
                <p className="text-text-muted text-sm">Track and process bills with OCR extraction</p>
                <p className="text-sm text-accent-violet mt-2">{bills.length} bills</p>
              </div>
              <div className="card-base">
                <Workflow className="h-8 w-8 text-primary-green mb-4" />
                <h3 className="text-xl font-bold text-text-dark mb-2">Approvals</h3>
                <p className="text-text-muted text-sm">Streamlined approval workflows</p>
                <p className="text-sm text-primary-green mt-2">{bills.filter(b => b.status === 'pending').length} pending</p>
              </div>
            </div>

            {/* Bill Upload Section */}
            <div className="card-base">
              <Upload className="h-8 w-8 text-primary-blue mb-4" />
              <h3 className="text-xl font-bold text-text-dark mb-2">Upload Bill</h3>
              <p className="text-text-muted mb-4">Drag and drop or click to upload a bill for OCR processing</p>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-blue bg-primary-blue/5'
                    : 'border-gray-300 hover:border-primary-blue/50'
                }`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="space-y-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
                    <p className="text-text-muted">Uploading and processing...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-dark font-medium mb-2">
                      {isDragActive ? 'Drop bill here...' : 'Drag and drop bill PDF or image here'}
                    </p>
                    <p className="text-sm text-text-muted">Supports PDF, PNG, JPG</p>
                  </>
                )}
              </div>
            </div>

            {/* Recent Bills */}
            <div className="card-base">
              <h2 className="text-2xl font-bold text-text-dark mb-4">Recent Bills</h2>
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-text-dark font-semibold">{bill.vendor_name}</div>
                      <div className="text-text-muted text-sm">Due: {new Date(bill.due_date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-text-dark font-bold">${bill.total_amount.toLocaleString()}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bill.status === 'paid' ? 'bg-primary-green/20 text-primary-green' :
                        bill.status === 'approved' ? 'bg-primary-blue/20 text-primary-blue' :
                        bill.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                        'bg-status-error/20 text-status-error'
                      }`}>{bill.status}</span>
                      {bill.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveBill(bill.id)}
                            className="p-2 bg-primary-green text-white rounded hover:bg-primary-green/90"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectBill(bill.id)}
                            className="p-2 bg-status-error text-white rounded hover:bg-status-error/90"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

