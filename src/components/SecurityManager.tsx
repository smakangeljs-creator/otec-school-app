import React, { useState, useEffect } from 'react';
import { AppData, SecurityData, GateLogEntry, VisitorRecord, UnknownPersonAlert, SecurityGateStatus, SecurityPersonType } from '../types';
import dataManager from '../lib/db';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Camera,
  Fingerprint,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  UserX,
  Clock,
  QrCode,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  Plus,
  Radio,
  Volume2,
  VolumeX,
  Building2,
  Car,
  FileText,
  Sparkles,
  Phone,
  User,
  Check,
  Share2,
  Send,
  Eye,
  Loader2,
  HardDrive,
  Cpu,
  Activity,
  Maximize2,
  Minimize2,
  Grid,
  Monitor,
  Zap,
  Bell
} from 'lucide-react';

interface SecurityManagerProps {
  data: AppData;
  onUpdateSecurity?: (updatedSec: SecurityData) => void;
}

interface CameraFeedConfig {
  id: string;
  name: string;
  location: string;
  ip: string;
  fps: number;
  resolution: string;
  status: 'ONLINE' | 'RECORDING' | 'MOTION' | 'OFFLINE';
  type: 'Biometric AI' | 'Pedestrian Turnstile' | 'ANPR Vehicle Barrier' | '180° Reception Wide';
  livenessConfidence?: number;
}

export default function SecurityManager({ data, onUpdateSecurity }: SecurityManagerProps) {
  // Default sample alerts if none provided
  const defaultInitialAlerts: UnknownPersonAlert[] = [
    {
      id: 'unk-1',
      timestamp: new Date().toISOString(),
      gateUsed: 'Main Gate - Gate A',
      alarmActive: true,
      reason: 'Unrecognized Face & Fingerprint',
      status: 'Active Alarm',
      severity: 'CRITICAL',
      loggedBy: 'Hikvision AI Vision Sensor (IP 192.168.1.101)',
      notes: 'Biometric database match failed. Liveness score: 14.2% (Unrecognized subject).'
    },
    {
      id: 'unk-2',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      gateUsed: 'Pedestrian Gate B',
      alarmActive: true,
      reason: 'Anti-Spoofing Failure',
      status: 'Active Alarm',
      severity: 'HIGH',
      loggedBy: 'ZKTeco Dual-Lens Camera (IP 192.168.1.102)',
      notes: '2D Photo paper reflection detected at camera lens. Anti-spoofing alert triggered.'
    },
    {
      id: 'unk-3',
      timestamp: new Date(Date.now() - 52 * 60000).toISOString(),
      gateUsed: 'Vehicle Barrier C',
      alarmActive: false,
      reason: 'Tailgating Detected',
      status: 'Resolved',
      severity: 'MEDIUM',
      loggedBy: 'Barrier Infra-Red Sensor',
      notes: 'Secondary vehicle attempted entry without ANPR badge validation.'
    }
  ];

  const defaultInitialVisitors: VisitorRecord[] = [
    {
      id: 'vis-1',
      visitorName: 'Eng. David Mukasa',
      phone: '+256 772 123456',
      nationalId: 'CM880123948576',
      company: 'Ministry of Education Inspectorate',
      purpose: 'Routine School Standards Assessment',
      hostTeacherName: 'Headteacher Nsubuga',
      vehicleNumber: 'UBL 402P',
      badgeNumber: 'OTEC-V-101',
      qrCode: 'OTEC-VIS-880101',
      arrivalTime: new Date(Date.now() - 40 * 60000).toISOString(),
      expectedDepartureTime: new Date(Date.now() + 80 * 60000).toISOString(),
      status: 'Inside School',
      approvedByGuard: 'Sgt. Okello Ronald'
    },
    {
      id: 'vis-2',
      visitorName: 'Mrs. Florence Kigozi',
      phone: '+256 701 987654',
      nationalId: 'CF910293847561',
      company: 'Parent / Guardian (P.6 Learner)',
      purpose: 'Report Card Clarification & Fee Adjustment',
      hostTeacherName: 'Tr. Samuel Ddungu',
      vehicleNumber: 'UBG 119A',
      badgeNumber: 'OTEC-V-102',
      qrCode: 'OTEC-VIS-910102',
      arrivalTime: new Date(Date.now() - 160 * 60000).toISOString(),
      expectedDepartureTime: new Date(Date.now() - 30 * 60000).toISOString(),
      status: 'Overdue',
      approvedByGuard: 'Sgt. Okello Ronald'
    }
  ];

  const initialSecurity: SecurityData = data.security && data.security.gateLogs.length > 0 ? data.security : {
    gateLogs: data.security?.gateLogs || [
      {
        id: 'glog-1',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        personType: 'Student',
        personName: data.learners[0]?.name || 'Akello Mary',
        personId: data.learners[0]?.admNo || 'STU-001',
        classOrDepartment: data.learners[0]?.cls || 'P.7',
        verificationMethod: 'Face Recognition',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Present',
        notes: 'Gate auto-unlocked. Parent notified via SMS.',
        parentNotified: true,
        temperatureCelsius: 36.5,
        livenessConfidence: 99.1
      },
      {
        id: 'glog-2',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        personType: 'Teacher',
        personName: 'Tr. Samuel Ddungu',
        personId: 'TCH-102',
        classOrDepartment: 'Academic Staff',
        verificationMethod: 'Fingerprint (ZKTeco)',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Present',
        notes: 'Teacher clock-in logged for payroll.',
        workHoursLogged: 8.0,
        temperatureCelsius: 36.6
      }
    ],
    visitors: data.security?.visitors && data.security.visitors.length > 0 ? data.security.visitors : defaultInitialVisitors,
    unknownAlerts: data.security?.unknownAlerts && data.security.unknownAlerts.length > 0 ? data.security.unknownAlerts : defaultInitialAlerts,
    config: data.security?.config || {
      gateState: 'Locked',
      autoOpenForStudents: true,
      autoOpenForTeachers: true,
      notifyParentsOnEntry: true,
      notifyParentsOnExit: true,
      livenessDetectionEnabled: true,
      antiSpoofingEnabled: true,
      tailgatingAlarmEnabled: true,
      hikvisionCamConnected: true,
      zktecoScannerConnected: true,
      relayControllerOnline: true,
      activeGateName: 'Main Gate - Gate A'
    }
  };

  const [secState, setSecState] = useState<SecurityData>(initialSecurity);
  const [activeTab, setActiveTab] = useState<'grid' | 'simulator' | 'visitors' | 'logs' | 'alarms' | 'hardware'>('grid');

  // Keep state synced with external data updates
  useEffect(() => {
    if (data.security) {
      setSecState(data.security);
    }
  }, [data.security]);

  const updateStateAndPersist = (newSec: SecurityData) => {
    setSecState(newSec);
    dataManager.updateSecurityData(newSec);
    if (onUpdateSecurity) {
      onUpdateSecurity(newSec);
    }
  };

  // Helper toasts
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    window.dispatchEvent(new CustomEvent('otec-toast', { detail: { message, type } }));
  };

  // -------------------------------------------------------------
  // Live Camera Feeds Grid State
  // -------------------------------------------------------------
  const [cameraFeeds] = useState<CameraFeedConfig[]>([
    {
      id: 'cam-01',
      name: 'Gate A - Main Entrance (Face AI)',
      location: 'Main Gate Barrier',
      ip: '192.168.1.101',
      fps: 60,
      resolution: '4K Ultra HD',
      status: 'RECORDING',
      type: 'Biometric AI',
      livenessConfidence: 99.4
    },
    {
      id: 'cam-02',
      name: 'Gate B - Pedestrian Turnstile',
      location: 'Student Foot Entrance',
      ip: '192.168.1.102',
      fps: 30,
      resolution: '1080P HD',
      status: 'RECORDING',
      type: 'Pedestrian Turnstile'
    },
    {
      id: 'cam-03',
      name: 'Gate C - Vehicle Barrier (ANPR)',
      location: 'Staff & Bus Driveway',
      ip: '192.168.1.103',
      fps: 60,
      resolution: '4K Ultra HD',
      status: 'MOTION',
      type: 'ANPR Vehicle Barrier'
    },
    {
      id: 'cam-04',
      name: 'Zone D - Visitor Reception Lounge',
      location: 'Admin Block Front',
      ip: '192.168.1.104',
      fps: 30,
      resolution: '1080P HD',
      status: 'ONLINE',
      type: '180° Reception Wide'
    }
  ]);

  const [expandedCamId, setExpandedCamId] = useState<string | null>(null);
  const [camIRNightMode, setCamIRNightMode] = useState<{ [id: string]: boolean }>({});
  const [camMuted, setCamMuted] = useState<{ [id: string]: boolean }>({ 'cam-01': false, 'cam-02': true, 'cam-03': true, 'cam-04': true });

  const toggleNightMode = (camId: string) => {
    setCamIRNightMode(prev => ({ ...prev, [camId]: !prev[camId] }));
    triggerToast(`Camera IR Night Vision ${!camIRNightMode[camId] ? 'ENABLED' : 'DISABLED'}`, 'info');
  };

  const toggleMute = (camId: string) => {
    setCamMuted(prev => ({ ...prev, [camId]: !prev[camId] }));
  };

  // -------------------------------------------------------------
  // Terminal / Gate Simulator State
  // -------------------------------------------------------------
  const [simStep, setSimStep] = useState<'idle' | 'scanning_face' | 'scanning_finger' | 'verified' | 'denied'>('idle');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(data.learners[0]?.id || '');
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>(data.settings.teachersList?.[0]?.name || 'Tr. Samuel Ddungu');
  const [lastMatchResult, setLastMatchResult] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Hikvision 4K AI Vision Sensor Online (192.168.1.101)`,
    `[${new Date().toLocaleTimeString()}] ZKTeco Biometric Reader Active (ZK9500)`,
    `[${new Date().toLocaleTimeString()}] Gate Relay Controller Online: Status LOCKED`
  ]);

  const logTerminal = (msg: string) => {
    setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 30)]);
  };

  // Trigger Biometric Verification Sequence
  const handleRunGateSimulation = (personType: SecurityPersonType) => {
    setSimStep('scanning_face');
    setLastMatchResult(null);
    logTerminal(`Initiating camera face detection for target type: ${personType}...`);

    setTimeout(() => {
      setSimStep('scanning_finger');
      logTerminal(`Hikvision Face matched. Prompting ZKTeco Fingerprint Verification...`);

      setTimeout(() => {
        const nowIso = new Date().toISOString();
        const gateName = secState.config.activeGateName;

        if (personType === 'Student') {
          const student = data.learners.find(l => l.id === selectedStudentId) || data.learners[0];
          const newLog: GateLogEntry = {
            id: 'glog-' + Date.now(),
            timestamp: nowIso,
            personType: 'Student',
            personName: student ? student.name : 'Sample Student',
            personId: student ? student.admNo : 'STU-001',
            classOrDepartment: student ? student.cls : 'P.7',
            verificationMethod: 'Face Recognition',
            gateUsed: gateName,
            direction: 'Entry',
            status: 'Present',
            notes: 'Gate auto-unlocked upon biometric verification.',
            parentNotified: secState.config.notifyParentsOnEntry,
            temperatureCelsius: 36.5,
            livenessConfidence: 99.2
          };

          const updatedLogs = [newLog, ...secState.gateLogs];
          const updatedSec = { ...secState, gateLogs: updatedLogs, config: { ...secState.config, gateState: 'Unlocked' as SecurityGateStatus } };
          updateStateAndPersist(updatedSec);

          setSimStep('verified');
          setLastMatchResult({
            success: true,
            title: `ACCESS GRANTED: ${student ? student.name : 'Student'}`,
            subtitle: `Class: ${student ? student.cls : 'Primary'} | ADM: ${student ? student.admNo : '001'}`,
            details: `Gate auto-opened (4s). Parent notified via SMS (+256 Guardian).`
          });

          logTerminal(`SUCCESS: Learner ${student?.name} verified. Gate relay opened!`);
          triggerToast(`Gate Opened! Student ${student?.name} verified & parent notified.`, 'success');

          setTimeout(() => {
            updateStateAndPersist({ ...updatedSec, config: { ...updatedSec.config, gateState: 'Locked' } });
            logTerminal(`Gate Relay auto-locked after safety delay.`);
          }, 4000);

        } else if (personType === 'Teacher') {
          const teacherName = selectedTeacherName;
          const newLog: GateLogEntry = {
            id: 'glog-' + Date.now(),
            timestamp: nowIso,
            personType: 'Teacher',
            personName: teacherName,
            personId: 'TCH-' + Math.floor(100 + Math.random() * 900),
            classOrDepartment: 'Academic Staff',
            verificationMethod: 'Face Recognition',
            gateUsed: gateName,
            direction: 'Entry',
            status: 'Present',
            notes: 'Teacher sign-in logged for payroll.',
            workHoursLogged: 8.0,
            temperatureCelsius: 36.6,
            livenessConfidence: 99.5
          };

          const updatedLogs = [newLog, ...secState.gateLogs];
          const updatedSec = { ...secState, gateLogs: updatedLogs, config: { ...secState.config, gateState: 'Unlocked' as SecurityGateStatus } };
          updateStateAndPersist(updatedSec);

          setSimStep('verified');
          setLastMatchResult({
            success: true,
            title: `TEACHER CLOCKED IN: ${teacherName}`,
            subtitle: `Department: Academic Staff | Device: ZKTeco + Hikvision`,
            details: `Payroll attendance recorded for today. Work hours active.`
          });

          logTerminal(`SUCCESS: Teacher ${teacherName} authenticated. Work hours recorded.`);
          triggerToast(`Teacher ${teacherName} clocked in successfully!`, 'success');

          setTimeout(() => {
            updateStateAndPersist({ ...updatedSec, config: { ...updatedSec.config, gateState: 'Locked' } });
            logTerminal(`Gate Relay auto-locked.`);
          }, 4000);

        } else if (personType === 'Visitor') {
          setSimStep('denied');
          setLastMatchResult({
            success: false,
            title: `GATE LOCKED: VISITOR DETECTED`,
            subtitle: `Automatic gate open DISABLED for Visitors`,
            details: `Visitors require manual Security Guard verification and visitor pass registration.`
          });

          logTerminal(`WARNING: Unregistered visitor approach. Gate remained LOCKED.`);
          triggerToast(`Visitor detected. Gate remains locked for guard registration.`, 'info');

        } else if (personType === 'Unknown') {
          const alarmLog: UnknownPersonAlert = {
            id: 'unk-' + Date.now(),
            timestamp: nowIso,
            gateUsed: gateName,
            alarmActive: true,
            reason: 'Unrecognized Face & Fingerprint',
            status: 'Active Alarm',
            severity: 'CRITICAL',
            loggedBy: 'Hikvision AI Security Sensor',
            notes: 'Anti-spoofing alert triggered. Unidentified person at main gate.'
          };

          const gateLog: GateLogEntry = {
            id: 'glog-' + Date.now(),
            timestamp: nowIso,
            personType: 'Unknown',
            personName: 'UNIDENTIFIED INTRUDER (ALERT)',
            verificationMethod: 'Unrecognized',
            gateUsed: gateName,
            direction: 'Entry',
            status: 'Alarm_Triggered',
            notes: 'Biometric verification failed. Red alert activated.'
          };

          const updatedAlerts = [alarmLog, ...secState.unknownAlerts];
          const updatedGateLogs = [gateLog, ...secState.gateLogs];
          const updatedSec = {
            ...secState,
            unknownAlerts: updatedAlerts,
            gateLogs: updatedGateLogs,
            config: { ...secState.config, gateState: 'Emergency_Lock' as SecurityGateStatus }
          };
          updateStateAndPersist(updatedSec);

          setSimStep('denied');
          setLastMatchResult({
            success: false,
            isAlarm: true,
            title: `🚨 RED ALERT: UNKNOWN PERSON DETECTED!`,
            subtitle: `Biometric database match failed (Face & Fingerprint)`,
            details: `Siren activated! Evidence photo captured & broadcasted to Security Center.`
          });

          logTerminal(`CRITICAL ALARM: Unknown person detected! System locked down!`);
          triggerToast(`🚨 RED SECURITY ALARM: Unknown person detected at gate!`, 'error');
        }
      }, 1200);
    }, 1000);
  };

  // Toggle Gate Relay State
  const handleSetGateState = (newState: SecurityGateStatus) => {
    const updatedSec = {
      ...secState,
      config: { ...secState.config, gateState: newState }
    };
    updateStateAndPersist(updatedSec);
    logTerminal(`Guard manually set Gate Relay State to ${newState.toUpperCase()}`);
    triggerToast(`Gate relay set to ${newState.replace('_', ' ')}`, 'info');
  };

  // -------------------------------------------------------------
  // Visitor Registration Modal State
  // -------------------------------------------------------------
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    phone: '',
    nationalId: '',
    company: '',
    purpose: 'Parent Inquiry / Fee Discussion',
    hostTeacherName: data.settings.teachersList?.[0]?.name || 'Headteacher Nsubuga',
    vehicleNumber: '',
    expectedHours: '2'
  });

  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.visitorName || !visitorForm.phone) {
      triggerToast('Please provide Visitor Name and Phone number', 'warning');
      return;
    }

    const now = new Date();
    const expTime = new Date(now.getTime() + parseFloat(visitorForm.expectedHours) * 3600000);
    const badgeNum = 'OTEC-V-' + (100 + secState.visitors.length + 1);

    const newVis: VisitorRecord = {
      id: 'vis-' + Date.now(),
      visitorName: visitorForm.visitorName,
      phone: visitorForm.phone,
      nationalId: visitorForm.nationalId || 'N/A',
      company: visitorForm.company || 'Private Visitor',
      purpose: visitorForm.purpose,
      hostTeacherName: visitorForm.hostTeacherName,
      vehicleNumber: visitorForm.vehicleNumber || 'None',
      badgeNumber: badgeNum,
      qrCode: `OTEC-VIS-${Date.now().toString().slice(-6)}`,
      arrivalTime: now.toISOString(),
      expectedDepartureTime: expTime.toISOString(),
      status: 'Inside School',
      approvedByGuard: 'Sgt. Okello Ronald'
    };

    const gateLog: GateLogEntry = {
      id: 'glog-' + Date.now(),
      timestamp: now.toISOString(),
      personType: 'Visitor',
      personName: visitorForm.visitorName,
      personId: badgeNum,
      classOrDepartment: visitorForm.company || 'Visitor',
      verificationMethod: 'Manual Guard Approval',
      gateUsed: secState.config.activeGateName,
      direction: 'Entry',
      status: 'Approved',
      notes: `Host: ${visitorForm.hostTeacherName} | Purpose: ${visitorForm.purpose}`
    };

    const updatedSec = {
      ...secState,
      visitors: [newVis, ...secState.visitors],
      gateLogs: [gateLog, ...secState.gateLogs]
    };

    updateStateAndPersist(updatedSec);
    setShowVisitorModal(false);
    setVisitorForm({
      visitorName: '',
      phone: '',
      nationalId: '',
      company: '',
      purpose: 'Parent Inquiry / Fee Discussion',
      hostTeacherName: data.settings.teachersList?.[0]?.name || 'Headteacher Nsubuga',
      vehicleNumber: '',
      expectedHours: '2'
    });

    triggerToast(`Visitor ${newVis.visitorName} registered! Badge #${badgeNum} printed.`, 'success');
  };

  // Visitor Check Out
  const handleCheckOutVisitor = (visitorId: string) => {
    const now = new Date();
    const updatedVisitors = secState.visitors.map(v => {
      if (v.id === visitorId) {
        const arrMs = new Date(v.arrivalTime).getTime();
        const durationMins = Math.round((now.getTime() - arrMs) / 60000);
        return {
          ...v,
          status: 'Exited' as const,
          actualDepartureTime: now.toISOString(),
          durationMinutes: durationMins
        };
      }
      return v;
    });

    const targetVis = secState.visitors.find(v => v.id === visitorId);
    const gateLog: GateLogEntry = {
      id: 'glog-' + Date.now(),
      timestamp: now.toISOString(),
      personType: 'Visitor',
      personName: targetVis ? targetVis.visitorName : 'Visitor',
      personId: targetVis?.badgeNumber,
      verificationMethod: 'QR Code',
      gateUsed: secState.config.activeGateName,
      direction: 'Exit',
      status: 'Left',
      notes: 'Visitor checked out via QR pass scan.'
    };

    const updatedSec = {
      ...secState,
      visitors: updatedVisitors,
      gateLogs: [gateLog, ...secState.gateLogs]
    };

    updateStateAndPersist(updatedSec);
    triggerToast(`Visitor ${targetVis?.visitorName} checked out successfully.`, 'success');
  };

  // -------------------------------------------------------------
  // Logs Search & Filters State
  // -------------------------------------------------------------
  const [logSearch, setLogSearch] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState<string>('all');

  const filteredLogs = secState.gateLogs.filter(log => {
    const matchesSearch = log.personName.toLowerCase().includes(logSearch.toLowerCase()) ||
                          (log.personId && log.personId.toLowerCase().includes(logSearch.toLowerCase())) ||
                          (log.classOrDepartment && log.classOrDepartment.toLowerCase().includes(logSearch.toLowerCase()));
    const matchesRole = logRoleFilter === 'all' || log.personType.toLowerCase() === logRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  // Calculate Quick Stats
  const totalLogsToday = secState.gateLogs.length;
  const activeVisitors = secState.visitors.filter(v => v.status === 'Inside School' || v.status === 'Overdue');
  const overdueVisitors = secState.visitors.filter(v => v.status === 'Overdue' || (v.status === 'Inside School' && new Date(v.expectedDepartureTime) < new Date()));
  const activeAlarms = secState.unknownAlerts.filter(a => a.alarmActive);

  // System Alarms Severity Color Mapping Helper
  const getSeverityInfo = (alert: UnknownPersonAlert) => {
    const sev = alert.severity || (
      alert.reason === 'Forced Entry Attempt' || alert.reason === 'Unrecognized Face & Fingerprint'
        ? 'CRITICAL'
        : alert.reason === 'Anti-Spoofing Failure' || alert.reason === 'Tailgating Detected'
          ? 'HIGH'
          : 'MEDIUM'
    );

    switch (sev) {
      case 'CRITICAL':
        return {
          label: 'CRITICAL SEVERITY',
          badgeClass: 'bg-rose-600 text-white font-black animate-pulse border border-rose-400 shadow-xs px-2.5 py-1 rounded-md text-[10px] tracking-wider flex items-center gap-1',
          cardClass: 'bg-rose-950/90 border-rose-600 text-rose-100 shadow-lg shadow-rose-950/50',
          icon: AlertTriangle
        };
      case 'HIGH':
        return {
          label: 'HIGH SEVERITY',
          badgeClass: 'bg-orange-600 text-white font-black border border-orange-400 shadow-xs px-2.5 py-1 rounded-md text-[10px] tracking-wider flex items-center gap-1',
          cardClass: 'bg-orange-950/80 border-orange-600 text-orange-100 shadow-md',
          icon: ShieldAlert
        };
      case 'MEDIUM':
        return {
          label: 'MEDIUM WARNING',
          badgeClass: 'bg-amber-500 text-slate-900 font-extrabold border border-amber-300 shadow-xs px-2.5 py-1 rounded-md text-[10px] tracking-wider flex items-center gap-1',
          cardClass: 'bg-amber-950/70 border-amber-600 text-amber-100 shadow-xs',
          icon: Clock
        };
      case 'LOW':
      default:
        return {
          label: 'LOW / INFO',
          badgeClass: 'bg-blue-600 text-white font-bold border border-blue-400 shadow-xs px-2.5 py-1 rounded-md text-[10px] tracking-wider flex items-center gap-1',
          cardClass: 'bg-slate-900 border-slate-700 text-slate-200',
          icon: Shield
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Title & Status Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 text-white">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">OTEC Smart Gate Security Command Center</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase rounded-full tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  4 AI Cameras &amp; Biometrics Online
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Off Tu Education Centre — Responsive CCTV Feeds, Live Visitor Registry &amp; Severity-Badged AI System Alarms
              </p>
            </div>
          </div>
        </div>

        {/* Live Gate Relay Control Buttons */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800 shrink-0">
          <span className="text-[10px] font-black uppercase text-slate-400 px-2 tracking-wider">Gate State:</span>
          <button
            type="button"
            onClick={() => handleSetGateState('Unlocked')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              secState.config.gateState === 'Unlocked'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Unlock size={14} />
            <span>Open Gate</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetGateState('Locked')}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              secState.config.gateState === 'Locked'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Lock size={14} />
            <span>Locked</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetGateState('Emergency_Lock')}
            className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
              secState.config.gateState === 'Emergency_Lock'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 ring-2 ring-rose-400 animate-pulse'
                : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900 border border-rose-800/60'
            }`}
          >
            <ShieldAlert size={14} />
            <span>EMERGENCY LOCKDOWN</span>
          </button>
        </div>
      </div>

      {/* Critical Overdue Visitors Banner Alert (if any) */}
      {overdueVisitors.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500 rounded-2xl p-4 shadow-xl text-white flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 rounded-xl text-white shadow-md animate-bounce shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wide text-rose-200 flex items-center gap-2">
                <span>SECURITY ALERT: {overdueVisitors.length} Overdue Visitor{overdueVisitors.length > 1 ? 's' : ''} On Campus</span>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md">HIGH SEVERITY</span>
              </h4>
              <p className="text-xs text-rose-100/90 font-medium">
                Visitor stay duration exceeded! Expected departure passed for: {overdueVisitors.map(v => `${v.visitorName} (Host: ${v.hostTeacherName})`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('visitors')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            View Visitor Pass List
          </button>
        </div>
      )}

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Today's Gate Entries</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{totalLogsToday}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">+Active</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Recorded across all gate channels</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Learners Arrived</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{secState.gateLogs.filter(l => l.personType === 'Student').length}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {data.learners.length} Total
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Parent SMS notifications dispatching</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Teachers Clocked In</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{secState.gateLogs.filter(l => l.personType === 'Teacher').length}</span>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">On Duty</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Payroll attendance ledger synced</p>
        </div>

        <div className={`p-4 rounded-2xl shadow-sm border space-y-1 transition-all ${
          overdueVisitors.length > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Visitors On-Site</span>
          <div className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{activeVisitors.length}</span>
            {overdueVisitors.length > 0 && (
              <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                {overdueVisitors.length} Overdue!
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">Active visitor passes issued</p>
        </div>

        <div className={`p-4 rounded-2xl shadow-sm border space-y-1 transition-all ${
          activeAlarms.length > 0 ? 'bg-rose-900 text-white border-rose-600' : 'bg-white border-slate-200'
        }`}>
          <span className={`text-[10px] font-black uppercase tracking-wider block ${activeAlarms.length > 0 ? 'text-rose-200' : 'text-slate-400'}`}>
            Security Alarms
          </span>
          <div className="text-2xl font-black flex items-center gap-2">
            <span>{activeAlarms.length}</span>
            {activeAlarms.length > 0 ? (
              <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                CRITICAL
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                All Clear
              </span>
            )}
          </div>
          <p className={`text-[10px] font-medium ${activeAlarms.length > 0 ? 'text-rose-200/80' : 'text-slate-500'}`}>
            Color-coded severity system active
          </p>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('grid')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'grid'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid size={15} />
          <span>Live CCTV &amp; Security Grid</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'simulator'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Fingerprint size={15} />
          <span>Gate Biometric Terminal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('visitors')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'visitors'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck size={15} />
          <span>Visitor Registry</span>
          {activeVisitors.length > 0 && (
            <span className="px-1.5 py-0.2 bg-emerald-400 text-slate-900 text-[10px] font-black rounded-full">
              {activeVisitors.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'logs'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} />
          <span>Gate Attendance Logs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alarms')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'alarms'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert size={15} />
          <span>AI Security Alarms</span>
          {secState.unknownAlerts.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-black rounded-full">
              {secState.unknownAlerts.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'hardware'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders size={15} />
          <span>Device Configuration</span>
        </button>
      </div>

      {/* SUB TAB 1: RESPONSIVE SECURITY COMMAND GRID (CCTV + VISITORS + ALARMS WITH SEVERITY BADGES) */}
      {activeTab === 'grid' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* MAIN LEFT COLUMN: 4-CAMERA CCTV FEEDS & RECENT VISITORS (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* CARD 1: LIVE CCTV CAMERA FEEDS GRID */}
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Camera size={18} className="text-blue-400" />
                    Live CCTV Monitoring Grid (4 Channels)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                    Hikvision + ZKTeco SDK 4.2
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('simulator')}
                    className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Fingerprint size={12} />
                    <span>Run Scanner</span>
                  </button>
                </div>
              </div>

              {/* 2x2 CCTV Feeds Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cameraFeeds.map((cam) => {
                  const isIR = camIRNightMode[cam.id];
                  const isMuted = camMuted[cam.id];

                  return (
                    <div
                      key={cam.id}
                      className={`relative aspect-video rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between p-3 group shadow-inner ${
                        isIR
                          ? 'bg-emerald-950/90 border-emerald-700/80'
                          : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-slate-800'
                      }`}
                    >
                      {/* Grid overlay pattern */}
                      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none"></div>

                      {/* Feed Top Header */}
                      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-800">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          <span className="font-extrabold text-white">{cam.name}</span>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-800 text-slate-400">
                          <span>{cam.resolution}</span>
                          <span>|</span>
                          <span>{cam.fps} FPS</span>
                        </div>
                      </div>

                      {/* Feed Center Simulated AI Bounding / HUD Visual */}
                      <div className="relative z-10 my-auto flex flex-col items-center justify-center space-y-1.5 py-2">
                        {cam.id === 'cam-01' ? (
                          <div className={`w-28 h-20 rounded-xl border-2 flex flex-col items-center justify-center p-1 transition-all ${
                            simStep !== 'idle' ? 'border-emerald-400 bg-emerald-500/20 animate-pulse' : 'border-dashed border-blue-500/60 bg-blue-500/10'
                          }`}>
                            <Camera size={20} className={simStep !== 'idle' ? 'text-emerald-400' : 'text-blue-400'} />
                            <span className="text-[9px] font-black text-blue-200 mt-1">Liveness 99.4%</span>
                          </div>
                        ) : cam.id === 'cam-02' ? (
                          <div className="w-24 h-16 rounded-xl border border-indigo-500/50 bg-indigo-500/10 flex flex-col items-center justify-center">
                            <Fingerprint size={22} className="text-indigo-400" />
                            <span className="text-[9px] font-bold text-indigo-200">ZKTeco NFC Active</span>
                          </div>
                        ) : cam.id === 'cam-03' ? (
                          <div className="w-32 h-12 rounded-lg border border-amber-500/60 bg-amber-500/10 flex items-center justify-center px-2 gap-2">
                            <Car size={18} className="text-amber-400" />
                            <span className="text-[10px] font-mono font-black text-amber-200">UBL 402P (ANPR)</span>
                          </div>
                        ) : (
                          <div className="w-28 h-14 rounded-xl border border-slate-700 bg-slate-800/40 flex flex-col items-center justify-center">
                            <Building2 size={20} className="text-slate-400" />
                            <span className="text-[9px] font-semibold text-slate-400">Zone D Clear</span>
                          </div>
                        )}
                      </div>

                      {/* Feed Bottom Controls Bar */}
                      <div className="relative z-10 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <span>IP: {cam.ip}</span>
                          {isIR && <span className="text-emerald-400 font-bold bg-emerald-950 px-1 rounded">IR NIGHT</span>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleNightMode(cam.id)}
                            title="Toggle Night Vision IR"
                            className={`p-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                              isIR ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                          >
                            IR
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleMute(cam.id)}
                            title="Toggle Audio Feed"
                            className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                          >
                            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} className="text-emerald-400" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedCamId(cam.id)}
                            title="Expand Camera Feed"
                            className="p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-xs"
                          >
                            <Maximize2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD 2: RECENT VISITOR LOGS PANEL */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <UserCheck size={18} className="text-blue-600" />
                    Recent Visitor Passes &amp; On-Campus Registry
                  </h3>
                  <p className="text-xs text-slate-500">Live guard activity with countdown timers and QR code checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span>Register Visitor</span>
                </button>
              </div>

              {/* Visitor Cards List */}
              <div className="space-y-3">
                {secState.visitors.slice(0, 4).map((vis) => {
                  const isOverdue = vis.status === 'Overdue' || (vis.status === 'Inside School' && new Date(vis.expectedDepartureTime) < new Date());
                  return (
                    <div
                      key={vis.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isOverdue
                          ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                          : vis.status === 'Inside School'
                            ? 'bg-slate-50 border-slate-200 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-slate-900">{vis.visitorName}</span>
                          <span className="text-[10px] font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                            {vis.badgeNumber}
                          </span>
                          {isOverdue ? (
                            <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded-full animate-pulse">
                              OVERDUE
                            </span>
                          ) : vis.status === 'Inside School' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[9px] rounded-full">
                              INSIDE CAMPUS
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[9px] rounded-full">
                              CHECKED OUT ({vis.durationMinutes || 0}m)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                          <span>Org: <strong>{vis.company || 'Private'}</strong></span>
                          <span>Host: <strong>{vis.hostTeacherName}</strong></span>
                          <span>Vehicle: <strong>{vis.vehicleNumber || 'None'}</strong></span>
                        </div>

                        <div className="text-[10px] text-slate-500">
                          Purpose: {vis.purpose} | Arrived: {new Date(vis.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {vis.status !== 'Exited' ? (
                          <button
                            type="button"
                            onClick={() => handleCheckOutVisitor(vis.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <QrCode size={12} />
                            <span>Scan Exit Pass</span>
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">Pass Closed</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setActiveTab('visitors')}
                  className="text-xs font-extrabold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  View Full Visitor Registry ({secState.visitors.length}) &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CRITICAL SYSTEM ALARMS & QUICK GATE CONTROLS (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* CARD 3: CRITICAL SYSTEM ALARMS PANEL WITH SEVERITY BADGES */}
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={20} className="text-rose-500 animate-bounce" />
                  <h3 className="text-sm font-black text-white">System Security Alarms</h3>
                </div>
                <span className="px-2.5 py-0.5 bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-black rounded-full uppercase">
                  {secState.unknownAlerts.length} Recorded
                </span>
              </div>

              {/* Alarms List with Severity Badges */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-none">
                {secState.unknownAlerts.map((alert) => {
                  const sevInfo = getSeverityInfo(alert);
                  const SevIcon = sevInfo.icon;

                  return (
                    <div
                      key={alert.id}
                      className={`p-3.5 rounded-2xl border transition-all space-y-2 ${sevInfo.cardClass}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={sevInfo.badgeClass}>
                          <SevIcon size={12} />
                          <span>{sevInfo.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-white">{alert.reason}</h4>
                        <p className="text-[11px] text-slate-200 mt-0.5">{alert.notes}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span>Gate: {alert.gateUsed}</span>
                        <span>{alert.status}</span>
                      </div>

                      {alert.alarmActive && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = secState.unknownAlerts.map(a => a.id === alert.id ? { ...a, alarmActive: false, status: 'Resolved' as const } : a);
                              updateStateAndPersist({ ...secState, unknownAlerts: updated });
                              triggerToast('Alarm resolved by security officer.', 'info');
                            }}
                            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] rounded-xl transition-all cursor-pointer shadow-xs border border-slate-700"
                          >
                            Mark Alarm Resolved
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('alarms')}
                  className="text-xs font-extrabold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  View All Alarms History &rarr;
                </button>
              </div>
            </div>

            {/* CARD 4: QUICK GATE BIOMETRIC SIMULATOR TRIGGER */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  Quick Gate Test Workflows
                </h3>
                <p className="text-xs text-slate-500">Test instant biometric face recognition &amp; parent alerts</p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Student')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera size={14} />
                  <span>Test Learner Gate Verification</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Teacher')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Fingerprint size={14} />
                  <span>Test Teacher Biometric Clock-In</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Unknown')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={14} />
                  <span>Test Unknown Intruder Alarm</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: DETAILED GATE BIOMETRIC SIMULATOR & TERMINAL */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Left Column: Camera Feed & Scanner Viewfinder */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <h3 className="text-sm font-black text-white">Hikvision AI Face Sensor (Gate A)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  Liveness Check: ACTIVE (99.4%)
                </span>
              </div>

              {/* Viewfinder */}
              <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner group">
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

                <div className={`relative z-10 w-48 h-48 rounded-3xl border-2 flex flex-col items-center justify-between p-3 transition-all duration-300 ${
                  simStep === 'scanning_face' || simStep === 'scanning_finger'
                    ? 'border-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20 animate-pulse'
                    : simStep === 'verified'
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-lg shadow-emerald-500/30'
                      : simStep === 'denied'
                        ? 'border-rose-500 bg-rose-500/20 shadow-lg shadow-rose-500/30'
                        : 'border-dashed border-slate-600 bg-slate-800/40'
                }`}>
                  <div className="w-full flex justify-between items-center text-[9px] font-black uppercase text-slate-300">
                    <span>HIKVISION AI</span>
                    <span>1080P HD</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 my-auto">
                    {simStep === 'scanning_face' && (
                      <>
                        <Camera size={36} className="text-blue-400 animate-bounce" />
                        <span className="text-[11px] font-extrabold text-blue-300">Scanning Face Angles...</span>
                      </>
                    )}
                    {simStep === 'scanning_finger' && (
                      <>
                        <Fingerprint size={36} className="text-indigo-400 animate-pulse" />
                        <span className="text-[11px] font-extrabold text-indigo-300">ZKTeco Fingerprint Match...</span>
                      </>
                    )}
                    {simStep === 'verified' && (
                      <>
                        <CheckCircle2 size={40} className="text-emerald-400" />
                        <span className="text-[11px] font-black text-emerald-300">BIOMETRIC MATCHED</span>
                      </>
                    )}
                    {simStep === 'denied' && (
                      <>
                        <XCircle size={40} className="text-rose-400" />
                        <span className="text-[11px] font-black text-rose-300">UNRECOGNIZED / LOCKED</span>
                      </>
                    )}
                    {simStep === 'idle' && (
                      <>
                        <User size={36} className="text-slate-500" />
                        <span className="text-[10px] font-semibold text-slate-400">Target Positioning Area</span>
                      </>
                    )}
                  </div>

                  <div className="w-full text-center text-[9px] font-mono text-slate-400">
                    {simStep === 'idle' ? 'STAND IN FRONT OF CAMERA' : 'PROCESSING ENCRYPTION...'}
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${secState.config.gateState === 'Unlocked' ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`}></span>
                  <span>Relay Lock: {secState.config.gateState.replace('_', ' ')}</span>
                </div>
              </div>

              {lastMatchResult && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  lastMatchResult.isAlarm 
                    ? 'bg-rose-950/80 border-rose-500 text-rose-100 animate-pulse'
                    : lastMatchResult.success 
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-100'
                      : 'bg-amber-950/60 border-amber-700 text-amber-100'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h4 className="text-sm font-black">{lastMatchResult.title}</h4>
                      <p className="text-xs font-semibold opacity-90">{lastMatchResult.subtitle}</p>
                      <p className="text-xs opacity-80">{lastMatchResult.details}</p>
                    </div>
                    {lastMatchResult.success && (
                      <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold text-[10px] rounded-lg uppercase tracking-wider shrink-0">
                        Gate Open (4s)
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Console Log Stream */}
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 text-white space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-blue-400" />
                  Live Hardware Terminal Stream
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Port 8080</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-[11px] text-emerald-400/90 h-36 overflow-y-auto space-y-1 scrollbar-none border border-slate-800/80">
                {terminalLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed hover:text-emerald-300">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Sparkles size={18} className="text-blue-600" />
                  Test Gate Verification Scenarios
                </h3>
                <p className="text-xs text-slate-500">
                  Select a person type and trigger full biometric face &amp; fingerprint verification simulation.
                </p>
              </div>

              {/* Scenario 1: Student Gate Verification */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} className="text-blue-600" />
                    1. Student Entry (Auto-Open &amp; SMS)
                  </span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {data.learners.length} Enrolled
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Select Learner from Roster:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    {data.learners.slice(0, 30).map(learner => (
                      <option key={learner.id} value={learner.id}>
                        {learner.name} ({learner.cls} - {learner.admNo})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Student')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Simulate Student Gate Approach</span>
                </button>
              </div>

              {/* Scenario 2: Teacher Gate Clock-In */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck size={14} className="text-teal-600" />
                    2. Teacher Gate Clock-In (Payroll)
                  </span>
                  <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                    Staff Duty
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block">Select Staff Member:</label>
                  <select
                    value={selectedTeacherName}
                    onChange={(e) => setSelectedTeacherName(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    {(data.settings.teachersList && data.settings.teachersList.length > 0
                      ? data.settings.teachersList
                      : [{ id: '1', name: 'Tr. Samuel Ddungu' }, { id: '2', name: 'Tr. Sarah Namukasa' }, { id: '3', name: 'Headteacher Nsubuga' }]
                    ).map(t => (
                      <option key={t.name} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Teacher')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Fingerprint size={14} />
                  <span>Simulate Teacher Biometric Clock-In</span>
                </button>
              </div>

              {/* Scenario 3: Visitor Entry Attempt */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                  3. Visitor Gate Approach (Gate Remains Locked)
                </span>
                <p className="text-[11px] text-amber-800">
                  Visitors do NOT open the gate automatically. Prompts security guard to register pass.
                </p>
                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Visitor')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simulate Visitor Gate Approach
                </button>
              </div>

              {/* Scenario 4: Unknown Person Intruder Alarm */}
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <span className="text-xs font-black text-rose-900 uppercase tracking-wider block">
                  4. Unknown / Intruder (Red Alert Siren)
                </span>
                <p className="text-[11px] text-rose-800">
                  Unrecognized face &amp; fingerprint. Triggers red alarm and evidence capture.
                </p>
                <button
                  type="button"
                  onClick={() => handleRunGateSimulation('Unknown')}
                  disabled={simStep !== 'idle'}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simulate Unknown Intruder Alarm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: VISITOR REGISTRY */}
      {activeTab === 'visitors' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900">Active &amp; Historical Visitor Registry</h3>
              <p className="text-xs text-slate-500">
                Security guard visitor pass management with countdown timers &amp; QR code check-outs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowVisitorModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Register New Visitor</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200 text-[10px]">
                    <th className="p-3">Badge &amp; Visitor</th>
                    <th className="p-3">Company &amp; NIN</th>
                    <th className="p-3">Host &amp; Purpose</th>
                    <th className="p-3">Arrival &amp; Exp. Departure</th>
                    <th className="p-3">Vehicle</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {secState.visitors.map((vis) => {
                    const isOverdue = vis.status === 'Overdue' || (vis.status === 'Inside School' && new Date(vis.expectedDepartureTime) < new Date());
                    return (
                      <tr key={vis.id} className={`hover:bg-slate-50/80 transition-colors ${isOverdue ? 'bg-rose-50/50' : ''}`}>
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900">{vis.visitorName}</div>
                          <div className="text-[10px] text-blue-600 font-mono font-bold">{vis.badgeNumber}</div>
                          <div className="text-[10px] text-slate-500">{vis.phone}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{vis.company || 'Private'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{vis.nationalId}</div>
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="font-bold text-slate-900">{vis.hostTeacherName}</div>
                          <div className="text-[10px] text-slate-500 line-clamp-1">{vis.purpose}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-[11px] font-semibold text-slate-800">
                            In: {new Date(vis.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Exp: {new Date(vis.expectedDepartureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-700 font-semibold">
                          {vis.vehicleNumber || 'No Car'}
                        </td>
                        <td className="p-3">
                          {isOverdue ? (
                            <span className="px-2.5 py-1 bg-rose-600 text-white font-extrabold text-[10px] rounded-full animate-pulse shadow-xs">
                              OVERDUE
                            </span>
                          ) : vis.status === 'Inside School' ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full border border-emerald-300">
                              Inside Campus
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-extrabold text-[10px] rounded-full">
                              Exited ({vis.durationMinutes || 0}m)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {vis.status !== 'Exited' ? (
                            <button
                              type="button"
                              onClick={() => handleCheckOutVisitor(vis.id)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ml-auto"
                            >
                              <QrCode size={12} />
                              <span>Scan Exit Pass</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Checked Out</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 4: GATE ATTENDANCE LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, ID, class..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={logRoleFilter}
                onChange={(e) => setLogRoleFilter(e.target.value)}
                className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="visitor">Visitors</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Showing {filteredLogs.length} of {secState.gateLogs.length} gate movements
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-extrabold uppercase border-b border-slate-200 text-[10px]">
                    <th className="p-3">Time &amp; Direction</th>
                    <th className="p-3">Person Name</th>
                    <th className="p-3">Role &amp; Class/Dept</th>
                    <th className="p-3">Verification Method</th>
                    <th className="p-3">Gate Channel</th>
                    <th className="p-3">Parent Notification</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">{log.personName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{log.personId || 'N/A'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          log.personType === 'Student' ? 'bg-blue-100 text-blue-800' :
                          log.personType === 'Teacher' ? 'bg-teal-100 text-teal-800' :
                          log.personType === 'Visitor' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.personType} ({log.classOrDepartment || 'General'})
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700">{log.verificationMethod}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 font-semibold">{log.gateUsed}</td>
                      <td className="p-3">
                        {log.parentNotified ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            SMS Sent (+256)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{log.notes || 'Normal entry'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 5: AI SECURITY ALARMS WITH SEVERITY BADGES */}
      {activeTab === 'alarms' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={22} className="text-rose-500 animate-bounce" />
                <h3 className="text-base font-black text-white">AI Anti-Spoofing &amp; Intruder Security Ledger</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Color-Coded Severity Levels Enabled
              </span>
            </div>

            <div className="space-y-3">
              {secState.unknownAlerts.map((alert) => {
                const sevInfo = getSeverityInfo(alert);
                const SevIcon = sevInfo.icon;

                return (
                  <div key={alert.id} className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${sevInfo.cardClass}`}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={sevInfo.badgeClass}>
                          <SevIcon size={12} />
                          <span>{sevInfo.label}</span>
                        </span>
                        <span className="text-xs font-extrabold text-white">{alert.reason}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-medium">{alert.notes}</p>
                      <div className="text-[10px] text-slate-400">Sensor: {alert.loggedBy} | Location: {alert.gateUsed}</div>
                    </div>

                    {alert.alarmActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = secState.unknownAlerts.map(a => a.id === alert.id ? { ...a, alarmActive: false, status: 'Resolved' as const } : a);
                          updateStateAndPersist({ ...secState, unknownAlerts: updated });
                          triggerToast('Security alarm resolved.', 'info');
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0 border border-slate-700 shadow-sm"
                      >
                        Resolve Alert
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800">
                        Resolved
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 6: DEVICE & HARDWARE CONFIGURATION */}
      {activeTab === 'hardware' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">Biometric &amp; Hardware Integration Settings</h3>
            <p className="text-xs text-slate-500">Configure Hikvision Camera API, ZKTeco Fingerprint SDK &amp; Parent FCM Push Settings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Cpu size={16} className="text-blue-600" />
                Hardware Drivers
              </h4>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Hikvision AI Face Recognition (4K)</div>
                  <div className="text-[10px] text-slate-500">SDK v4.2.1 | IP 192.168.1.101</div>
                </div>
                <input
                  type="checkbox"
                  checked={secState.config.hikvisionCamConnected}
                  onChange={(e) => updateStateAndPersist({ ...secState, config: { ...secState.config, hikvisionCamConnected: e.target.checked } })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">ZKTeco Fingerprint Reader (ZK9500)</div>
                  <div className="text-[10px] text-slate-500">USB Sensor Connected</div>
                </div>
                <input
                  type="checkbox"
                  checked={secState.config.zktecoScannerConnected}
                  onChange={(e) => updateStateAndPersist({ ...secState, config: { ...secState.config, zktecoScannerConnected: e.target.checked } })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Automatic Gate Barrier Relay</div>
                  <div className="text-[10px] text-slate-500">Magnetic Lock Controller</div>
                </div>
                <input
                  type="checkbox"
                  checked={secState.config.relayControllerOnline}
                  onChange={(e) => updateStateAndPersist({ ...secState, config: { ...secState.config, relayControllerOnline: e.target.checked } })}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Radio size={16} className="text-indigo-600" />
                Notification &amp; Security Automation
              </h4>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">Notify Parents on Gate Entry</div>
                  <div className="text-[10px] text-slate-500">Sends instant SMS upon student arrival</div>
                </div>
                <input
                  type="checkbox"
                  checked={secState.config.notifyParentsOnEntry}
                  onChange={(e) => updateStateAndPersist({ ...secState, config: { ...secState.config, notifyParentsOnEntry: e.target.checked } })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-extrabold text-slate-900">AI Anti-Spoofing &amp; Liveness Guard</div>
                  <div className="text-[10px] text-slate-500">Rejects photo/screen spoof attacks</div>
                </div>
                <input
                  type="checkbox"
                  checked={secState.config.livenessDetectionEnabled}
                  onChange={(e) => updateStateAndPersist({ ...secState, config: { ...secState.config, livenessDetectionEnabled: e.target.checked } })}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EXPANDED CCTV CAMERA FEED */}
      <AnimatePresence>
        {expandedCamId && (() => {
          const cam = cameraFeeds.find(c => c.id === expandedCamId);
          if (!cam) return null;
          const isIR = camIRNightMode[cam.id];

          return (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 text-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Camera size={18} className="text-blue-400" />
                      {cam.name}
                    </h3>
                    <p className="text-xs text-slate-400">Location: {cam.location} | IP: {cam.ip}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedCamId(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
                  >
                    <XCircle size={20} />
                  </button>
                </div>

                <div className={`relative aspect-video rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center ${
                  isIR ? 'bg-emerald-950/90 border-emerald-700' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
                }`}>
                  <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

                  <div className="relative z-10 text-center space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/90 border border-slate-800 rounded-full text-xs font-mono font-black text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>LIVE STREAMING @ {cam.fps} FPS ({cam.resolution})</span>
                    </div>

                    <div className="text-slate-400 text-xs font-medium">
                      AI Analytics Active &bull; Motion Detection Engine Enabled &bull; H.265 Direct Stream
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span>REC 02:41:19</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleNightMode(cam.id)}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                        isIR ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Night Vision IR Mode
                    </button>

                    <button
                      type="button"
                      onClick={() => triggerToast(`Snapshot saved for ${cam.name}`, 'success')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                    >
                      Capture AI Snapshot
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedCamId(null)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close Modal
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* REGISTER NEW VISITOR MODAL */}
      <AnimatePresence>
        {showVisitorModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck size={18} className="text-blue-600" />
                  Register New Visitor Pass
                </h3>
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleRegisterVisitor} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Visitor Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eng. David Mukasa"
                      value={visitorForm.visitorName}
                      onChange={(e) => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Phone Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="+256 700 000000"
                      value={visitorForm.phone}
                      onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">National ID / NIN</label>
                    <input
                      type="text"
                      placeholder="CM880..."
                      value={visitorForm.nationalId}
                      onChange={(e) => setVisitorForm({ ...visitorForm, nationalId: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Organization / Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Ministry of Education"
                      value={visitorForm.company}
                      onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Host Teacher / Staff</label>
                    <select
                      value={visitorForm.hostTeacherName}
                      onChange={(e) => setVisitorForm({ ...visitorForm, hostTeacherName: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      {(data.settings.teachersList && data.settings.teachersList.length > 0
                        ? data.settings.teachersList
                        : [{ id: '1', name: 'Tr. Samuel Ddungu' }, { id: '2', name: 'Headteacher Nsubuga' }]
                      ).map(t => (
                        <option key={t.name} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Expected Stay Duration</label>
                    <select
                      value={visitorForm.expectedHours}
                      onChange={(e) => setVisitorForm({ ...visitorForm, expectedHours: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">1 Hour</option>
                      <option value="2">2 Hours</option>
                      <option value="4">4 Hours</option>
                      <option value="8">Full Day (8 Hours)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Purpose of Visit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Term 3 Fee Inquiry & Report Pick-Up"
                    value={visitorForm.purpose}
                    onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                    className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowVisitorModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer size={14} />
                    <span>Approve &amp; Issue Visitor Pass</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
