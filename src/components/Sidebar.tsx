import React, { useState, useEffect } from 'react';
import { AppData } from '../types';
import dataManager, { activeUser, syncStatus } from '../lib/db';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import AuthModal from './AuthModal';
import { motion } from 'motion/react';
import { 
  Home, 
  Users, 
  FileSpreadsheet, 
  GraduationCap, 
  Settings as SettingsIcon, 
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  LogIn,
  Sliders,
  Calendar,
  Wallet,
  CreditCard,
  WifiOff,
  Wifi,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  data: AppData;
  syncState: typeof syncStatus;
  user: typeof activeUser;
}

export default function Sidebar({ currentRoute, setCurrentRoute, data, syncState, user }: SidebarProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTick, setLastSyncTick] = useState(0);
  const [workOffline, setWorkOffline] = useState(() => {
    return localStorage.getItem('otec_work_offline') === 'true' || !dataManager.isSyncEnabled();
  });
  const [isBackupStale, setIsBackupStale] = useState(false);

  useEffect(() => {
    const checkStaleSnapshot = () => {
      try {
        const raw = localStorage.getItem('otec_daily_cloud_snapshots');
        let lastSyncMs = 0;
        if (raw) {
          const snaps = JSON.parse(raw);
          if (Array.isArray(snaps) && snaps.length > 0) {
            const newestUploaded = snaps.find((s: any) => s.uploadedToGDrive);
            const newestSnap = snaps[0];
            if (newestUploaded && newestUploaded.timestamp) {
              lastSyncMs = new Date(newestUploaded.timestamp).getTime();
            } else if (newestSnap && newestSnap.timestamp) {
              lastSyncMs = new Date(newestSnap.timestamp).getTime();
            }
          }
        }

        if (!lastSyncMs) {
          const savedDateStr = localStorage.getItem('otec_last_daily_cloud_snapshot_date');
          if (savedDateStr) {
            lastSyncMs = new Date(savedDateStr).getTime();
          }
        }

        if (!lastSyncMs) {
          setIsBackupStale(true);
        } else {
          const diffMs = Date.now() - lastSyncMs;
          setIsBackupStale(diffMs >= 48 * 60 * 60 * 1000);
        }
      } catch (e) {
        setIsBackupStale(false);
      }
    };

    checkStaleSnapshot();
    const interval = setInterval(checkStaleSnapshot, 30000); // check every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Interval to refresh the human readable last sync text e.g. "5s ago"
    const timer = setInterval(() => {
      setLastSyncTick(t => t + 1);
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(timer);
    };
  }, []);

  const handleToggleWorkOffline = (offline: boolean) => {
    setWorkOffline(offline);
    localStorage.setItem('otec_work_offline', offline ? 'true' : 'false');
    dataManager.setSyncEnabled(!offline);

    if (offline) {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Work Offline mode active. Cloud auto-sync is suspended and all edits are stored locally.',
          type: 'info'
        }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Work Offline disabled. Restoring cloud connectivity and syncing changes...',
          type: 'success'
        }
      }));
      handleManualSync();
    }
  };

  const handleManualSync = async () => {
    if (workOffline) {
      setWorkOffline(false);
      localStorage.setItem('otec_work_offline', 'false');
      dataManager.setSyncEnabled(true);
    } else if (!dataManager.isSyncEnabled()) {
      dataManager.setSyncEnabled(true);
    }

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Syncing local database with cloud storage...',
        type: 'info'
      }
    }));

    try {
      await dataManager.forceSync();
      setLastSyncTick(t => t + 1);
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Manual sync completed successfully!',
          type: 'success'
        }
      }));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('otec-toast', {
        detail: {
          message: 'Sync failed: ' + (err?.message || 'Check network connection'),
          type: 'warning'
        }
      }));
    }
  };

  const lastSync = dataManager.getLastSyncedTime();
  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    try {
      const date = new Date(lastSync);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      if (diffMs < 10000) return 'Just now';
      if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
      if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Never';
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'learners', label: 'Learners', icon: Users },
    { id: 'scores', label: 'Enter Scores', icon: FileSpreadsheet },
    { id: 'reports', label: 'Report Cards', icon: GraduationCap },
    { id: 'finance', label: 'School Finances', icon: Wallet },
    { id: 'security', label: 'Security & Gate', icon: ShieldCheck },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'data', label: 'Import / Export', icon: Database },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out from Cloud sync? Your local offline work will remain intact.')) {
      localStorage.setItem('otec_manually_signed_out', 'true');
      await signOut(auth);
    }
  };

  // Status indicator config
  const getStatusConfig = () => {
    if (workOffline) {
      return { 
        icon: WifiOff, 
        text: 'Work Offline (Forced)', 
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
      };
    }
    switch (syncState) {
      case 'synced':
        return { 
          icon: Cloud, 
          text: 'Cloud Active', 
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
        };
      case 'syncing':
        return { 
          icon: RefreshCw, 
          text: 'Syncing...', 
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' 
        };
      case 'error':
        return { 
          icon: CloudOff, 
          text: 'Sync Error', 
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' 
        };
      case 'offline':
      default:
        return { 
          icon: CloudOff, 
          text: 'Offline Mode', 
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' 
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-screen sticky top-0 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-lg shadow-blue-600/20 overflow-hidden shrink-0">
              {data.settings.logo ? (
                <img src={data.settings.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                (data.settings.shortName || 'OT').slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-white line-clamp-1">
                {data.settings.schoolName || 'OTEC'}
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                Uganda Report Cards
              </p>
            </div>
          </div>
        </div>

        {/* Current Context */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="bg-slate-800 px-2.5 py-1 rounded-md text-[9px] text-slate-300">{data.settings.term}</span>
          <span className="font-mono text-slate-500">{data.settings.year}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentRoute(item.id)}
                className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-tight transition-all duration-150 outline-hidden ${
                  isActive
                    ? 'text-blue-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-blue-600/15 rounded-xl border border-blue-500/20 shadow-xs z-0"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-between w-full">
                  <span className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'} />
                    <span>{item.label}</span>
                  </span>
                  {item.id === 'data' && isBackupStale && (
                    <span 
                      className="px-1.5 py-0.5 bg-rose-600 text-white font-black text-[9px] uppercase rounded-full animate-pulse shadow-xs shadow-rose-600/50 flex items-center gap-0.5"
                      title="Cloud Snapshot sync overdue (>48 hours)"
                    >
                      <AlertTriangle size={10} />
                      <span>!</span>
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Cloud Sync Status Card */}
        <div className="p-4 mt-auto">
          <div className="bg-slate-950/50 border border-slate-800/80 p-4 rounded-2xl text-xs space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Sync Engine</span>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wide ${workOffline ? 'bg-amber-500/10 text-amber-400' : isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {workOffline ? 'Forced Local' : isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 bg-slate-900/60 border border-slate-800/50 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className={`w-2.5 h-2.5 rounded-full ${workOffline ? 'bg-amber-500' : syncState === 'synced' ? 'bg-emerald-500' : syncState === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-slate-500'}`} />
                  {syncState === 'syncing' && !workOffline && (
                    <span className="absolute -inset-0.5 rounded-full bg-amber-500/40 animate-ping" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200">{statusConfig.text}</span>
                  <span className="text-[9px] text-slate-500 font-medium">Last: {formatLastSync()}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {user && (
                  <button
                    onClick={handleSignOut}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-500 transition-colors cursor-pointer"
                    title="Sign Out of Cloud"
                  >
                    <LogOut size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Explicit Work Offline Toggle */}
            <div className="bg-slate-900/40 border border-slate-800/60 p-2.5 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <WifiOff size={13} className={workOffline ? "text-amber-400" : "text-slate-500"} />
                  <span className="text-slate-200 font-bold text-[11px]">Work Offline</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleWorkOffline(!workOffline)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    workOffline ? 'bg-amber-600' : 'bg-slate-800'
                  }`}
                  role="switch"
                  aria-checked={workOffline}
                  title={workOffline ? "Disable Work Offline mode and resume cloud sync" : "Enable Work Offline mode (force local storage)"}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      workOffline ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[9.5px] text-slate-500 font-medium leading-tight">
                {workOffline 
                  ? "Local-only mode active. Edits will stay on this browser until synced."
                  : "Auto cloud sync active for live multi-browser updates."}
              </p>
            </div>

            {/* Manual Sync Now Button */}
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncState === 'syncing'}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-[11px] rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              title="Force immediate synchronization with cloud storage"
            >
              <RefreshCw size={13} className={syncState === 'syncing' ? 'animate-spin text-white' : 'text-blue-100'} />
              <span>{syncState === 'syncing' ? 'Synchronizing...' : 'Sync Now'}</span>
            </button>

            {!user && (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-blue-500/20 shadow-xs cursor-pointer"
              >
                <LogIn size={12} />
                <span>Sign In to Cloud Sync</span>
              </button>
            )}
            
            {user && (
              <div className="text-[9px] text-slate-500 font-mono truncate text-center bg-slate-900/30 py-1.5 rounded-lg border border-slate-900/50">
                👤 {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
          {workOffline ? 'Work Offline Mode Active' : 'Offline Storage Active'}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

