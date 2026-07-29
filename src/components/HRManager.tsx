import React, { useState, useMemo } from 'react';
import { AppData, Teacher, NonTeachingStaff, PayrollRecord, AppraisalRecord } from '../types';
import { calculatePayroll, calculateGrossFromNet } from '../lib/payroll';
import { 
  Users, Briefcase, Cake, CalendarClock, DollarSign, Award, CheckCircle, 
  Search, Filter, Plus, FileText, ChevronDown, Download, X
} from 'lucide-react';
import DataTable, { ColumnDef } from './ui/DataTable';

interface HRManagerProps {
  data: AppData;
  onUpdateHR: (payroll: PayrollRecord[], appraisals: AppraisalRecord[]) => void;
  onUpdateStaff: (teachers: Teacher[], nonTeaching: NonTeachingStaff[]) => void;
}

type HRTab = 'directory' | 'payroll' | 'appraisals';

export default function HRManager({ data, onUpdateHR, onUpdateStaff }: HRManagerProps) {
  const [activeTab, setActiveTab] = useState<HRTab>('directory');
  
  // HR Edit Modal State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [showAppraisalModal, setShowAppraisalModal] = useState(false);
  const [appraisalStaffId, setAppraisalStaffId] = useState('');
  const [appraisalScore, setAppraisalScore] = useState('');
  const [appraisalComments, setAppraisalComments] = useState('');
  const [appraisalEvaluator, setAppraisalEvaluator] = useState('');
  const [appraisalDate, setAppraisalDate] = useState(new Date().toISOString().split('T')[0]);

  const [editDOB, setEditDOB] = useState('');
  const [editContractEnd, setEditContractEnd] = useState('');
  const [editBaseSalary, setEditBaseSalary] = useState('');
  const [editNetSalary, setEditNetSalary] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editTIN, setEditTIN] = useState('');
  const [editNSSF, setEditNSSF] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'On Leave' | 'Terminated'>('Active');
  
  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffType, setNewStaffType] = useState<'teacher' | 'non-teaching'>('teacher');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffDeptSpec, setNewStaffDeptSpec] = useState(''); // Department or Specialization
  const [newStaffDOB, setNewStaffDOB] = useState('');
  const [newStaffContractEnd, setNewStaffContractEnd] = useState('');
  const [newStaffBaseSalary, setNewStaffBaseSalary] = useState('');
  const [newStaffNetSalary, setNewStaffNetSalary] = useState('');
  const [newStaffTIN, setNewStaffTIN] = useState('');
  const [newStaffNSSF, setNewStaffNSSF] = useState('');
  
  // Print States
  const [printingPayslipId, setPrintingPayslipId] = useState<string | null>(null);
  const [printingContractId, setPrintingContractId] = useState<string | null>(null);
  
  // Combine all staff into a unified view
  const allStaff = useMemo(() => {
    const t = (data.settings?.teachers || data.teachers || []).map(tch => ({ ...tch, staffType: 'teacher' as const }));
    const nt = (data.settings?.nonTeachingStaff || []).map(nts => ({ ...nts, staffType: 'non-teaching' as const }));
    return [...t, ...nt];
  }, [data]);


  // Reminders
  const upcomingBirthdays = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    return allStaff.filter(s => {
      if (!s.dateOfBirth) return false;
      const dob = new Date(s.dateOfBirth);
      return dob.getMonth() === currentMonth;
    });
  }, [allStaff]);

  const expiringContracts = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return allStaff.filter(s => {
      if (!s.contractEndDate) return false;
      const end = new Date(s.contractEndDate);
      return end > today && end <= thirtyDaysFromNow;
    });
  }, [allStaff]);

  // Payroll generation
  const handleGeneratePayroll = () => {
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentPayroll = data.hr?.payroll || [];
    
    // Check if payroll already exists for this month
    const existing = currentPayroll.filter(p => p.month === month);
    if (existing.length > 0) {
      if (!confirm(`Payroll for ${month} already exists. Are you sure you want to regenerate it? Existing drafts will be overwritten.`)) {
        return;
      }
    }

    const newPayrollRecords = allStaff.map(staff => {
      const base = staff.baseSalary || 0;
      const result = calculatePayroll(base, 0); // Assuming 0 allowances for default generation
      
      return {
        id: `PR-${Date.now()}-${staff.id}`,
        staffId: staff.id,
        staffType: staff.staffType,
        month,
        baseSalary: base,
        allowances: 0,
        ...result,
        status: 'Draft' as const
      };
    });
    
    // Filter out old records for this month, add new ones
    const updatedPayroll = currentPayroll.filter(p => p.month !== month).concat(newPayrollRecords);
    onUpdateHR(updatedPayroll, data.hr?.appraisals || []);
  };

  const handleAddAppraisal = () => {
    if (!appraisalStaffId || !appraisalScore) return;
    
    const newAppraisal: AppraisalRecord = {
      id: `AP-${Date.now()}`,
      staffId: appraisalStaffId,
      score: Number(appraisalScore),
      comments: appraisalComments,
      evaluator: appraisalEvaluator,
      date: appraisalDate
    };
    
    const updatedAppraisals = [...(data.hr?.appraisals || []), newAppraisal];
    onUpdateHR(data.hr?.payroll || [], updatedAppraisals);
    
    setShowAppraisalModal(false);
    setAppraisalStaffId('');
    setAppraisalScore('');
    setAppraisalComments('');
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `S-${Date.now()}`;
    const baseStaff = {
      id: newId,
      name: newStaffName,
      phone: newStaffPhone,
      email: newStaffEmail,
      dateOfBirth: newStaffDOB,
      contractEndDate: newStaffContractEnd,
      baseSalary: Number(newStaffBaseSalary) || 0,
      tinNumber: newStaffTIN,
      nssfNumber: newStaffNSSF,
      status: 'Active' as const
    };

    if (newStaffType === 'teacher') {
      const newTeacher: Teacher = {
        ...baseStaff,
        role: 'Teacher',
        specialization: newStaffDeptSpec,
        type: 'teaching'
      };
      onUpdateStaff([...(data.settings?.teachers || data.teachers || []), newTeacher], data.settings?.nonTeachingStaff || []);
    } else {
      const newNonTeaching: NonTeachingStaff = {
        ...baseStaff,
        role: newStaffDeptSpec || 'Staff',
        department: newStaffDeptSpec,
        type: 'non-teaching'
      };
      onUpdateStaff(data.settings?.teachers || data.teachers || [], [...(data.settings?.nonTeachingStaff || []), newNonTeaching]);
    }

    setShowAddStaffModal(false);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
    setNewStaffDeptSpec('');
    setNewStaffDOB('');
    setNewStaffContractEnd('');
    setNewStaffBaseSalary('');
    setNewStaffNetSalary('');
    setNewStaffTIN('');
    setNewStaffNSSF('');
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'Staff member registered successfully!', type: 'success' } }));
  };

  const handleSaveHREdits = () => {
    if (!editingStaffId) return;
    
    // Find if it's a teacher or non-teaching staff
    const staffMember = allStaff.find(s => s.id === editingStaffId);
    if (!staffMember) return;
    
    const updates: any = {
      dateOfBirth: editDOB,
      contractEndDate: editContractEnd,
      baseSalary: Number(editBaseSalary) || undefined,
      tinNumber: editTIN,
      nssfNumber: editNSSF,
      status: editStatus
    };

    if (staffMember.staffType === 'teacher') {
      updates.specialization = editDepartment;
      const updatedTeachers = (data.settings?.teachers || data.teachers || []).map(t => 
        t.id === editingStaffId ? { ...t, ...updates } : t
      );
      onUpdateStaff(updatedTeachers, data.settings?.nonTeachingStaff || []);
    } else {
      updates.department = editDepartment;
      updates.role = editDepartment || 'Staff';
      const updatedNonTeaching = (data.settings?.nonTeachingStaff || []).map(t => 
        t.id === editingStaffId ? { ...t, ...updates } : t
      );
      onUpdateStaff(data.settings?.teachers || data.teachers || [], updatedNonTeaching);
    }
    
    setEditingStaffId(null);
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message: 'HR updates saved successfully!', type: 'success' } }));
  };

  const openEditModal = (staff: any) => {
    setEditingStaffId(staff.id);
    setEditDOB(staff.dateOfBirth || '');
    setEditContractEnd(staff.contractEndDate || '');
    setEditBaseSalary(staff.baseSalary ? String(staff.baseSalary) : '');
    setEditNetSalary(staff.baseSalary ? String(calculatePayroll(staff.baseSalary).netPay) : '');
    setEditDepartment(staff.specialization || staff.department || '');
    setEditTIN(staff.tinNumber || '');
    setEditNSSF(staff.nssfNumber || '');
    setEditStatus(staff.status || 'Active');
  };

  const staffColumns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: row => row.name,
      render: row => (
        <div className="font-bold text-slate-800 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-600">
            {row.name.charAt(0)}
          </div>
          {row.name}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      accessor: row => row.staffType === 'teacher' ? 'Teacher' : row.department || 'Staff',
      render: row => (
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
          row.staffType === 'teacher' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {row.staffType === 'teacher' ? 'Teacher' : row.department || 'Staff'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: row => row.status || 'Active',
      render: row => {
        const status = row.status || 'Active';
        let color = 'bg-slate-100 text-slate-800';
        if (status === 'Active') color = 'bg-emerald-100 text-emerald-800';
        if (status === 'On Leave') color = 'bg-amber-100 text-amber-800';
        return (
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${color}`}>
            {status}
          </span>
        );
      }
    },
    {
      key: 'contract',
      header: 'Contract End',
      accessor: row => row.contractEndDate || '-',
      render: row => <span className="font-medium text-slate-600">{row.contractEndDate || '-'}</span>
    },
    {
      key: 'salary',
      header: 'Base Salary (UGX)',
      accessor: row => row.baseSalary || 0,
      render: row => (
        <span className="font-black text-slate-700">
          {row.baseSalary ? row.baseSalary.toLocaleString() : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: row => (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            Edit Info
          </button>
          <button
            onClick={() => setPrintingContractId(row.id)}
            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg transition-colors"
          >
            Print Appt.
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={22} className="text-blue-600" />
            Human Resources & Payroll
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage staff, payroll (PAYE/NSSF), and performance appraisals</p>
        </div>
        <button 
          onClick={() => setShowAddStaffModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm shadow-sm shadow-blue-600/20 transition-all"
        >
          <Plus size={16} /> Register Staff
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 bg-white border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'directory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users size={16} /> Staff Directory
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'payroll' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign size={16} /> Payroll & Taxes
        </button>
        <button
          onClick={() => setActiveTab('appraisals')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'appraisals' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award size={16} /> Appraisals
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'directory' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-xs text-indigo-600">
                  <Cake size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Upcoming Birthdays</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {upcomingBirthdays.length > 0 
                      ? `${upcomingBirthdays.length} staff members have birthdays this month.`
                      : 'No birthdays this month.'}
                  </p>
                  {upcomingBirthdays.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {upcomingBirthdays.map(s => (
                        <span key={s.id} className="text-[10px] font-bold bg-white px-2 py-1 rounded-md text-indigo-700 shadow-xs">
                          {s.name} ({s.dateOfBirth?.substring(5)})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-xs text-rose-600">
                  <CalendarClock size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Contract Renewals</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {expiringContracts.length > 0 
                      ? `${expiringContracts.length} contracts expiring in the next 30 days.`
                      : 'No contracts expiring soon.'}
                  </p>
                  {expiringContracts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {expiringContracts.map(s => (
                        <span key={s.id} className="text-[10px] font-bold bg-white px-2 py-1 rounded-md text-rose-700 shadow-xs border border-rose-100">
                          {s.name} ({s.contractEndDate})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Directory List using DataTable */}
            <DataTable 
              data={allStaff}
              columns={staffColumns}
              exportFilename="otec_staff_directory.csv"
              searchPlaceholder="Search staff by name or role..."
            />
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Payroll Processing (Uganda)</h3>
              <button
                onClick={handleGeneratePayroll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2"
              >
                <Plus size={14} /> Generate Payroll (Current Month)
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Gross Pay</th>
                    <th className="px-4 py-3 text-rose-600">PAYE</th>
                    <th className="px-4 py-3 text-rose-600">NSSF (5%)</th>
                    <th className="px-4 py-3 text-emerald-600">NSSF (10%)</th>
                    <th className="px-4 py-3 text-right">Net Pay</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {(!data.hr?.payroll || data.hr.payroll.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No payroll records found. Click "Generate Payroll" to calculate taxes.
                      </td>
                    </tr>
                  ) : (
                    data.hr.payroll.map(pr => {
                      const staff = allStaff.find(s => s.id === pr.staffId);
                      return (
                        <tr key={pr.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-800">{staff?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 font-medium">{pr.grossPay.toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-rose-600">{pr.paye.toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-rose-600">{pr.nssfEmployee.toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-emerald-600">{pr.nssfEmployer.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-black text-slate-800">{pr.netPay.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${
                              pr.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {pr.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => setPrintingPayslipId(pr.id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors inline-flex items-center justify-center"
                              title="Print Payslip"
                            >
                              <FileText size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appraisals' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Performance Appraisals</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md">
                This module allows school administrators to log and track staff performance reviews, setting KPIs and monitoring development over time.
              </p>
              <button 
                onClick={() => setShowAppraisalModal(true)}
                className="mt-6 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                Start New Appraisal
              </button>
              
              <div className="mt-8 w-full max-w-4xl text-left">
                {data.hr?.appraisals?.length ? (
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Staff</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Evaluator</th>
                          <th className="px-4 py-3 font-semibold text-slate-700 text-center">Score</th>
                          <th className="px-4 py-3 font-semibold text-slate-700">Comments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...data.hr.appraisals].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(app => {
                          const staff = [...(data.settings?.teachers || []), ...(data.settings?.nonTeachingStaff || [])].find(s => s.id === app.staffId);
                          return (
                            <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{new Date(app.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{staff ? staff.name : 'Unknown Staff'}</td>
                              <td className="px-4 py-3 text-slate-600">{app.evaluator}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 rounded-md text-xs font-bold ${app.score >= 80 ? 'bg-emerald-100 text-emerald-700' : app.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                  {app.score}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate" title={app.comments}>{app.comments}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-500 text-sm italic">No appraisals recorded yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit HR Modal */}
      {editingStaffId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">Update HR Details</h3>
              <button 
                onClick={() => setEditingStaffId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editDOB}
                    onChange={e => setEditDOB(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Contract End Date</label>
                  <input
                    type="date"
                    value={editContractEnd}
                    onChange={e => setEditContractEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Department / Specialization</label>
                <input
                  type="text"
                  value={editDepartment}
                  onChange={e => setEditDepartment(e.target.value)}
                  placeholder="e.g. Science / Administration"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 mb-4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Base / Gross Salary (UGX)</label>
                  <input
                    type="number"
                    value={editBaseSalary}
                    onChange={e => {
                      setEditBaseSalary(e.target.value);
                      const net = calculatePayroll(Number(e.target.value) || 0).netPay;
                      setEditNetSalary(net > 0 ? String(net) : '');
                    }}
                    placeholder="e.g. 500000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Target Net Salary (UGX)</label>
                  <input
                    type="number"
                    value={editNetSalary}
                    onChange={e => {
                      setEditNetSalary(e.target.value);
                      const gross = calculateGrossFromNet(Number(e.target.value) || 0);
                      setEditBaseSalary(gross > 0 ? String(gross) : '');
                    }}
                    placeholder="Auto-calculates Gross"
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">TIN Number</label>
                  <input
                    type="text"
                    value={editTIN}
                    onChange={e => setEditTIN(e.target.value)}
                    placeholder="e.g. 100XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">NSSF Number</label>
                  <input
                    type="text"
                    value={editNSSF}
                    onChange={e => setEditNSSF(e.target.value)}
                    placeholder="e.g. 000XXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Employment Status</label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div className="p-6 pt-2 bg-slate-50/50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setEditingStaffId(null)}
                className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-xs hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHREdits}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print Appt Modal */}
      {printingContractId && (() => {
        const staff = allStaff.find(s => s.id === printingContractId);
        if (!staff) return null;
        
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[90vh] print:h-auto print:shadow-none print:w-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
                <h3 className="font-bold text-slate-800">Print Appointment Letter</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Print
                  </button>
                  <button 
                    onClick={() => setPrintingContractId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 bg-white print:overflow-visible text-sm text-slate-800">
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                  <h1 className="text-2xl font-black uppercase">{data.settings?.schoolName || 'Otec School'}</h1>
                  <p className="text-xs font-medium text-slate-500 mt-1">{data.settings?.schoolAddress || 'Kampala, Uganda'}</p>
                </div>
                
                <div className="flex justify-between mb-8">
                  <div>
                    <p className="font-bold">To:</p>
                    <p className="text-lg font-black">{staff.name}</p>
                    <p className="font-medium text-slate-600">ID: {staff.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Date:</p>
                    <p>{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-4 text-justify leading-relaxed">
                  <h2 className="text-lg font-black underline uppercase text-center mb-6">Letter of Appointment</h2>
                  
                  <p>Dear <strong>{staff.name}</strong>,</p>
                  
                  <p>
                    We are pleased to offer you the position of <strong>{staff.staffType === 'teacher' ? 'Teacher' : (staff as any).department || 'Staff'}</strong> at {data.settings?.schoolName || 'the School'}. 
                    This letter constitutes the formal terms of your employment, which will commence on {staff.dateOfJoining || 'your first day of work'}.
                  </p>
                  
                  <p><strong>1. Remuneration:</strong> Your starting basic salary will be <strong>UGX {staff.baseSalary ? staff.baseSalary.toLocaleString() : '___________'}</strong> per month. Payment will be made subject to statutory deductions including PAYE and NSSF.</p>
                  
                  <p><strong>2. Term of Employment:</strong> This contract is valid until <strong>{staff.contractEndDate || '___________'}</strong>, subject to satisfactory performance appraisals and school policies.</p>
                  
                  <p><strong>3. Duties and Responsibilities:</strong> You are expected to perform the duties associated with your role diligently and to adhere to the professional code of conduct of the institution at all times.</p>
                  
                  <p>Please sign and return a copy of this letter to the Human Resources office as indication of your acceptance of these terms.</p>
                  
                  <div className="mt-16 flex justify-between px-10">
                    <div className="text-center">
                      <div className="w-48 border-b border-slate-400 mb-2"></div>
                      <p className="font-bold text-xs uppercase">Employer's Signature</p>
                    </div>
                    <div className="text-center">
                      <div className="w-48 border-b border-slate-400 mb-2"></div>
                      <p className="font-bold text-xs uppercase">Employee's Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Print Payslip Modal */}
      {printingPayslipId && (() => {
        const pr = data.hr?.payroll.find(p => p.id === printingPayslipId);
        if (!pr) return null;
        const staff = allStaff.find(s => s.id === pr.staffId);
        
        return (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col print:h-auto print:shadow-none print:w-full border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
                <h3 className="font-bold text-slate-800">Payslip Preview</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Print
                  </button>
                  <button 
                    onClick={() => setPrintingPayslipId(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              
              <div className="p-8 bg-white print:overflow-visible text-sm text-slate-800">
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
                  <h1 className="text-xl font-black uppercase">{data.settings?.schoolName || 'Otec School'}</h1>
                  <p className="text-xs font-bold bg-slate-800 text-white inline-block px-3 py-1 mt-2 rounded-full uppercase tracking-wider">Official Payslip</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div>
                    <p className="text-slate-500 font-bold mb-1">Employee Details</p>
                    <p className="font-black text-sm">{staff?.name || 'Unknown'}</p>
                    <p>Role: <span className="font-medium uppercase">{staff?.staffType === 'teacher' ? 'Teacher' : (staff as any)?.department || 'Staff'}</span></p>
                    <p>NSSF No: {staff?.nssfNumber || 'N/A'}</p>
                    <p>TIN: {staff?.tinNumber || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 font-bold mb-1">Payslip Details</p>
                    <p>Month: <span className="font-black text-sm">{pr.month}</span></p>
                    <p>Status: <span className="font-bold">{pr.status}</span></p>
                    <p>Ref: {pr.id.split('-')[1]}</p>
                  </div>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-4 py-2 font-bold bg-slate-50">Base Salary</td>
                        <td className="px-4 py-2 text-right font-medium">UGX {pr.baseSalary.toLocaleString()}</td>
                      </tr>
                      {pr.allowances > 0 && (
                        <tr>
                          <td className="px-4 py-2 font-bold bg-slate-50">Allowances</td>
                          <td className="px-4 py-2 text-right font-medium">UGX {pr.allowances.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-100 border-y-2 border-slate-300">
                        <td className="px-4 py-2 font-black">Gross Earnings</td>
                        <td className="px-4 py-2 text-right font-black text-emerald-700">UGX {pr.grossPay.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold bg-slate-50 text-rose-700">NSSF Deduction (5%)</td>
                        <td className="px-4 py-2 text-right font-medium text-rose-700">-UGX {pr.nssfEmployee.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-bold bg-slate-50 text-rose-700">PAYE Tax</td>
                        <td className="px-4 py-2 text-right font-medium text-rose-700">-UGX {pr.paye.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-slate-800 text-white">
                        <td className="px-4 py-3 font-black text-lg">NET PAY</td>
                        <td className="px-4 py-3 text-right font-black text-lg">UGX {pr.netPay.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs border border-slate-200">
                  <p className="font-bold text-slate-600 mb-1">Employer Contributions (Not deducted from pay):</p>
                  <p>NSSF (10%): <strong>UGX {pr.nssfEmployer.toLocaleString()}</strong></p>
                </div>
                
                <div className="mt-12 text-center text-[10px] text-slate-400 font-medium">
                  <p>This is a computer generated document. No signature is required.</p>
                  <p>Generated on {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Appraisal Modal */}
      {showAppraisalModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800">New Performance Appraisal</h3>
              <button 
                onClick={() => setShowAppraisalModal(false)}
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!appraisalStaffId || !appraisalScore || !appraisalEvaluator) return;
              
              const isTeacher = data.settings?.teachers.some(t => t.id === appraisalStaffId);
              const newAppraisal: AppraisalRecord = {
                id: 'appr-' + Math.random().toString(36).substr(2, 9),
                staffId: appraisalStaffId,
                staffType: isTeacher ? 'teacher' : 'non-teaching',
                date: appraisalDate,
                evaluator: appraisalEvaluator,
                score: Number(appraisalScore),
                comments: appraisalComments
              };
              
              onUpdateHR(data.hr?.payroll || [], [...(data.hr?.appraisals || []), newAppraisal]);
              setShowAppraisalModal(false);
              setAppraisalStaffId('');
              setAppraisalScore('');
              setAppraisalComments('');
              setAppraisalEvaluator('');
            }} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Staff Member</label>
                <select 
                  required
                  value={appraisalStaffId}
                  onChange={e => setAppraisalStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Staff --</option>
                  <optgroup label="Teaching Staff">
                    {data.settings?.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                  <optgroup label="Non-Teaching Staff">
                    {data.settings?.nonTeachingStaff.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={appraisalDate}
                    onChange={e => setAppraisalDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Score (0-100)</label>
                  <input 
                    type="number"
                    required
                    min="0" max="100"
                    value={appraisalScore}
                    onChange={e => setAppraisalScore(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Evaluator Name</label>
                <input 
                  type="text"
                  required
                  value={appraisalEvaluator}
                  onChange={e => setAppraisalEvaluator(e.target.value)}
                  placeholder="e.g. Headteacher"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Comments / Notes</label>
                <textarea 
                  required
                  rows={3}
                  value={appraisalComments}
                  onChange={e => setAppraisalComments(e.target.value)}
                  placeholder="Enter evaluation notes, areas of improvement..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAppraisalModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Save Appraisal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> Register New Staff
              </h3>
              <button 
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full transition-colors"
              >
                <Plus size={20} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddStaff} className="p-6 space-y-6">
              <div className="flex gap-4">
                <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${newStaffType === 'teacher' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="staffType" value="teacher" checked={newStaffType === 'teacher'} onChange={() => setNewStaffType('teacher')} className="hidden" />
                  <div className="font-bold text-slate-800 mb-1">Teaching Staff</div>
                  <div className="text-xs text-slate-500 font-medium">Teachers and instructors</div>
                </label>
                <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${newStaffType === 'non-teaching' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="staffType" value="non-teaching" checked={newStaffType === 'non-teaching'} onChange={() => setNewStaffType('non-teaching')} className="hidden" />
                  <div className="font-bold text-slate-800 mb-1">Support Staff</div>
                  <div className="text-xs text-slate-500 font-medium">Admin, guards, cleaners, etc.</div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
                  <input required value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">{newStaffType === 'teacher' ? 'Specialization' : 'Department'} *</label>
                  <input required value={newStaffDeptSpec} onChange={e => setNewStaffDeptSpec(e.target.value)} placeholder={newStaffType === 'teacher' ? 'e.g. Math/Science' : 'e.g. Administration'} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number *</label>
                  <input required value={newStaffPhone} onChange={e => setNewStaffPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
                  <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Date of Birth</label>
                  <input type="date" value={newStaffDOB} onChange={e => setNewStaffDOB(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Contract End Date</label>
                  <input type="date" value={newStaffContractEnd} onChange={e => setNewStaffContractEnd(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Base Salary / Gross (UGX)</label>
                  <input type="number" value={newStaffBaseSalary} onChange={e => {
                    setNewStaffBaseSalary(e.target.value);
                    const net = calculatePayroll(Number(e.target.value) || 0).netPay;
                    setNewStaffNetSalary(net > 0 ? String(net) : '');
                  }} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target Net Salary (UGX)</label>
                  <input type="number" value={newStaffNetSalary} onChange={e => {
                    setNewStaffNetSalary(e.target.value);
                    const gross = calculateGrossFromNet(Number(e.target.value) || 0);
                    setNewStaffBaseSalary(gross > 0 ? String(gross) : '');
                  }} placeholder="Auto-calculates Gross" className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">TIN Number</label>
                  <input value={newStaffTIN} onChange={e => setNewStaffTIN(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">NSSF Number</label>
                  <input value={newStaffNSSF} onChange={e => setNewStaffNSSF(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                  Register Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
