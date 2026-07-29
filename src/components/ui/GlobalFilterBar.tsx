import React from 'react';
import { Search } from 'lucide-react';
import { ALL_CLASSES } from '../../lib/defaults';

interface FilterState {
  search: string;
  class?: string;
  sex?: string;
  status?: string;
}

export interface GlobalFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  
  showClassFilter?: boolean;
  selectedClass?: string;
  onClassChange?: (value: string) => void;
  
  showSexFilter?: boolean;
  selectedSex?: string;
  onSexChange?: (value: string) => void;

  showStatusFilter?: boolean;
  selectedStatus?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: { label: string; value: string }[];
  children?: React.ReactNode;
}

export default function GlobalFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search by name, ID...",
  showClassFilter = true,
  selectedClass = 'All',
  onClassChange,
  showSexFilter = true,
  selectedSex = 'All',
  onSexChange,
  showStatusFilter = false,
  selectedStatus = 'All',
  onStatusChange,
  statusOptions = [],
  children
}: GlobalFilterBarProps) {
  
  // Calculate grid columns dynamically based on how many filters are active
  const activeFilters = 1 + (showClassFilter ? 1 : 0) + (showSexFilter ? 1 : 0) + (showStatusFilter ? 1 : 0) + (children ? 1 : 0);
  let gridColsClass = 'sm:grid-cols-1';
  if (activeFilters === 2) gridColsClass = 'sm:grid-cols-2';
  else if (activeFilters === 3) gridColsClass = 'sm:grid-cols-3 md:grid-cols-4';
  else if (activeFilters === 4) gridColsClass = 'sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5';
  else if (activeFilters > 4) gridColsClass = 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6';

  return (
    <div className={`grid grid-cols-1 ${gridColsClass} gap-3 bg-slate-50 p-4 border border-slate-100 rounded-xl shadow-sm mb-4`}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
        />
      </div>

      {showClassFilter && onClassChange && (
        <div>
          <select
            value={selectedClass}
            onChange={e => onClassChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
          >
            <option value="All">All Classes</option>
            {ALL_CLASSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {showSexFilter && onSexChange && (
        <div>
          <select
            value={selectedSex}
            onChange={e => onSexChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
          >
            <option value="All">All Genders</option>
            <option value="Male">Boys / Male</option>
            <option value="Female">Girls / Female</option>
          </select>
        </div>
      )}

      {showStatusFilter && onStatusChange && (
        <div>
          <select
            value={selectedStatus}
            onChange={e => onStatusChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-600 focus:border-transparent transition-all"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      {children}
    </div>
  );
}
