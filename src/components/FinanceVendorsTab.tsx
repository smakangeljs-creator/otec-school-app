import React, { useState } from 'react';
import { AppData, Vendor, VendorInvoice } from '../types';
import dataManager from '../lib/db';
import { Store, FileText, CheckCircle, Clock, Plus, Filter, Search, DollarSign } from 'lucide-react';
import { formatUGX } from '../utils/formatters';

interface FinanceVendorsTabProps {
  data: AppData;
}

export default function FinanceVendorsTab({ data }: FinanceVendorsTabProps) {
  const vendors = data.vendors || [];
  const invoices = data.vendorInvoices || [];
  
  const [activeView, setActiveView] = useState<'vendors' | 'invoices'>('invoices');
  
  // Calculate totals
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Vendors</span>
          <div className="text-2xl font-black text-slate-800">{vendors.filter(v => v.status === 'Active').length}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Pending Payables</span>
          <div className="text-2xl font-black text-rose-600">{formatUGX(totalPending)}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Cleared Payables</span>
          <div className="text-2xl font-black text-emerald-600">{formatUGX(totalPaid)}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveView('invoices')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeView === 'invoices' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vendor Invoices
        </button>
        <button
          onClick={() => setActiveView('vendors')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeView === 'vendors' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Vendor Directory
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
        {activeView === 'invoices' ? (
          <div className="space-y-4">
            <FileText className="mx-auto text-slate-300 w-12 h-12" />
            <h3 className="text-lg font-bold text-slate-800">No Invoices Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Manage accounts payable by recording vendor invoices here. The system will bridge with the general ledger.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-700">
              <Plus size={16} /> Add Invoice
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Store className="mx-auto text-slate-300 w-12 h-12" />
            <h3 className="text-lg font-bold text-slate-800">No Vendors Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Add service providers and suppliers to manage their accounts and billing.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-blue-700">
              <Plus size={16} /> Add Vendor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
