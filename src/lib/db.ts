import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { silentSyncToGoogleDrive, autoRestoreFromGoogleDrive } from './googleDriveService';
import { AppData, BankAccount, BankTransfer, CommunicationsData, SchoolSettings, Learner, ScoreRecord, PsychomotorRecord, CommentRecord, ActivityLog, FinanceTransaction, SecurityData, GateLogEntry, VisitorRecord, UnknownPersonAlert, SecurityGateSystemConfig, TransportData, LibraryData, InventoryData, HostelData, TimetableData, ClinicData, DisciplineData, ExtracurricularData, HRData, AdmissionsData, ProcurementData, Vendor, VendorInvoice, PettyCashRequisition, AuditLog } from '../types';
import { getDemoData, defaultSettings, defaultPrePrimaryGradingBands, defaultSectionSubjects, regenerateUNEBNumbers, getDemoSecurityData } from './defaults';

export interface SyncMetric {
  id: string;
  timestamp: string;
  durationMs: number;
  payloadKb: number;
  status: 'synced' | 'cached' | 'error' | 'offline';
  trigger: string;
  details?: string;
}

const LOCAL_STORAGE_KEY = 'otec_report_card_data';

// --- INDEXEDDB ABSTRACTION ---
const DB_NAME = 'OTEC_Database';
const STORE_NAME = 'app_data';

let cachedDB: IDBDatabase | null = null;

const getDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  if (cachedDB) {
    return resolve(cachedDB);
  }
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e) => {
    (e.target as IDBOpenDBRequest).result.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => {
    cachedDB = request.result;
    resolve(cachedDB);
  };
  request.onerror = () => reject(request.error);
});

export const idb = {
  async get(key: string): Promise<any> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },
  async set(key: string, value: any): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
};
// -----------------------------

let lastSyncMetrics: SyncMetric = {
  id: 'init',
  timestamp: new Date().toLocaleString(),
  durationMs: 0,
  payloadKb: 0,
  status: 'cached',
  trigger: 'startup',
  details: 'Local database state loaded successfully'
};

let syncMetricsHistory: SyncMetric[] = [];
let lastSyncedDataHash: string = '';

try {
  const savedHist = localStorage.getItem('otec_sync_metrics_history');
  if (savedHist) {
    syncMetricsHistory = JSON.parse(savedHist);
    if (syncMetricsHistory.length > 0) {
      lastSyncMetrics = syncMetricsHistory[0];
    }
  }
} catch (e) {
  console.error('Failed to parse sync metrics history', e);
}

export function migrateLowerPrimarySubjects(data: AppData): AppData {
  if (!data || !data.settings || !data.settings.sections) return data;
  
  const lowerSec = data.settings.sections.lower;
  if (lowerSec) {
    const targetNames = ['English', 'Mathematics', 'Literacy 1', 'Literacy 2', 'Religious Education', 'Luganda'];
    const currentNames = lowerSec.subjects.map(s => s.name);
    const isMatched = currentNames.length === targetNames.length && currentNames.every((n, i) => n === targetNames[i]);
    
    if (!isMatched) {
      lowerSec.subjects = targetNames.map(name => ({ name, max: 100 }));
    }
  }

  const preSec = data.settings.sections.preprimary;
  if (preSec) {
    const targetNames = ['NUMBERS', 'ENGLISH', 'HEALTH HABBITS', 'SOCIAL DEVELOPMENTS', 'READING', 'WRITING', 'DRAWING'];
    const currentNames = preSec.subjects.map(s => s.name);
    const isMatched = currentNames.length === targetNames.length && currentNames.every((n, i) => n === targetNames[i]);
    
    if (!isMatched) {
      preSec.subjects = targetNames.map(name => ({ name, max: 100 }));
    }
    // Only set default pre-primary grading bands if not set, preserving user customizations and comments
    if (!preSec.grading || preSec.grading.length === 0) {
      preSec.grading = defaultPrePrimaryGradingBands();
    }
  }

  // Head teacher name update
  if (data.settings.headTeacherName === 'Mrs. Namubiru Justine' || !data.settings.headTeacherName) {
    data.settings.headTeacherName = 'Ssemakula Joseph';
    data.settings.headTeacherInitials = 'S.J.';
  }

  // Ensure calendarEvents exists and is populated
  if (!data.settings.calendarEvents || data.settings.calendarEvents.length === 0) {
    data.settings.calendarEvents = [
      { id: 'E1', title: 'Term 3 Official Opening Day', date: '2026-09-07', type: 'event', description: 'Welcome back students for the final academic term of the year.' },
      { id: 'E2', title: 'Independence Day Holiday', date: '2026-10-09', type: 'holiday', description: 'National public holiday. School remains closed for one day.' },
      { id: 'E3', title: 'Mid-Term Examinations Block', date: '2026-10-19', type: 'deadline', description: 'Mid-Term papers administered across all classes. Marks entry due by end of week.' },
      { id: 'E4', title: 'P7 UNEB PLE Mock Finals', date: '2026-11-09', type: 'deadline', description: 'Final mock series for Primary 7 candidates to prepare for UNEB PLE.' },
      { id: 'E5', title: 'Eid al-Adha Holiday', date: '2026-11-20', type: 'holiday', description: 'Eid holiday observed (subject to sighting of moon). School closed.' },
      { id: 'E6', title: 'End of Term Assessment Exams', date: '2026-11-30', type: 'deadline', description: 'Final End of Term promotional examinations.' },
      { id: 'E7', title: 'Christmas Thanksgiving Festival', date: '2026-12-04', type: 'event', description: 'Academic thanksgiving assembly, choir carols, and community feast.' },
      { id: 'E8', title: 'Report Cards & Graduation Day', date: '2026-12-11', type: 'event', description: 'Primary 7 promotional lists posted and Nurseries Graduation ceremony.' }
    ];
  }

  // Also migrate scores for lower classes!
  const lowerClasses = ['P1', 'P2', 'P3'];
  const lowerLearnerIds = new Set(data.learners.filter(l => lowerClasses.includes(l.cls)).map(l => l.id));

  // Migrate scores for pre-primary classes!
  const preprimaryClasses = ['ZEBRA', 'LION', 'ELEPHANT'];
  const preprimaryLearnerIds = new Set(data.learners.filter(l => preprimaryClasses.includes(l.cls)).map(l => l.id));

  if (data.scores) {
    Object.keys(data.scores).forEach(compositeKey => {
      const [learnerId] = compositeKey.split('|');
      if (lowerLearnerIds.has(learnerId)) {
        const scoreRec = data.scores[compositeKey];
        if (scoreRec) {
          const newScoreRec: Record<string, number> = {};
          
          Object.entries(scoreRec).forEach(([subjectName, marks]) => {
            if (subjectName === 'Science') {
              newScoreRec['Literacy 1'] = marks;
            } else if (subjectName === 'Creative Arts') {
              newScoreRec['Luganda'] = marks;
            } else if (subjectName === 'Social Studies') {
              // skip / remove
            } else {
              newScoreRec[subjectName] = marks;
            }
          });

          data.scores[compositeKey] = newScoreRec;
        }
      } else if (preprimaryLearnerIds.has(learnerId)) {
        const scoreRec = data.scores[compositeKey];
        if (scoreRec) {
          const newScoreRec: Record<string, number> = {};
          Object.entries(scoreRec).forEach(([subjectName, marks]) => {
            if (subjectName === 'Numeracy') {
              newScoreRec['NUMBERS'] = marks;
            } else if (subjectName === 'Literacy') {
              newScoreRec['ENGLISH'] = marks;
            } else if (subjectName === 'Creative Arts') {
              newScoreRec['DRAWING'] = marks;
            } else if (subjectName === 'Religious Education') {
              newScoreRec['SOCIAL DEVELOPMENTS'] = marks;
            } else if (subjectName === 'Physical Education') {
              newScoreRec['HEALTH HABBITS'] = marks;
            } else {
              newScoreRec[subjectName] = marks;
            }
          });
          data.scores[compositeKey] = newScoreRec;
        }
      }
    });
  }

  if (data.learners) {
    data.learners = regenerateUNEBNumbers(data.learners);
  }

  return data;
}

// Singleton AppState inside module scope
let currentData: AppData = migrateLowerPrimarySubjects(getDemoData());
let activeUser: User | null = null;
let localActiveUser: any = null; // SystemUserAccount
let syncStatus: 'idle' | 'syncing' | 'synced' | 'error' | 'offline' = 'offline';
let syncEnabled = localStorage.getItem('otec_sync_enabled') !== 'false'; // Defaults to true
let onStateChangeCallbacks: (() => void)[] = [];
let unsubscribeSnapshot: (() => void) | null = null;

// Load initial data from local storage
function loadFromLocal(): AppData {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (raw) {
    try {
      let parsed = JSON.parse(raw);
      // Basic validation
      if (parsed.learners && parsed.settings && parsed.scores) {
        parsed = migrateLowerPrimarySubjects(parsed);
        if (!parsed.finances) {
          parsed.finances = getDemoData().finances || [];
        }
        if (!parsed.security) {
          parsed.security = getDemoSecurityData();
        }
        if (!parsed.activityLog) {
          parsed.activityLog = [
            {
              id: 'init-1',
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
              type: 'settings_modified',
              details: 'Initial school settings and academic parameters configured.',
              operator: 'System'
            },
            {
              id: 'init-2',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: 'data_imported',
              details: 'Imported demo dataset of registered student records.',
              operator: 'System'
            }
          ];
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse local data', e);
    }
  }
  
  const demo = getDemoData();
  demo.activityLog = [
    {
      id: 'init-1',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      type: 'settings_modified',
      details: 'Initial school settings and academic parameters configured.',
      operator: 'System'
    },
    {
      id: 'init-2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'data_imported',
      details: 'Imported demo dataset of registered student records.',
      operator: 'System'
    }
  ];
  return demo;
}

// Global Client Session Identifier for multi-browser tab tracking
const TAB_CLIENT_ID = 'browser_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now();
let knownServerDbVersion = 0;
let hasLocalDirtyState = false;
let lastLocalMutationTime = 0;

let multiBrowserChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    multiBrowserChannel = new BroadcastChannel('otec_multi_browser_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel initialization skipped:', e);
}

// Function to broadcast changes to other browser windows/tabs
function broadcastDataChange(data: AppData) {
  try {
    const payload = {
      clientId: TAB_CLIENT_ID,
      timestamp: Date.now(),
      data
    };
    if (multiBrowserChannel) {
      multiBrowserChannel.postMessage(payload);
    }
    localStorage.setItem('otec_last_broadcast_ts', Date.now().toString());
  } catch (err) {
    console.warn('Failed to broadcast multi-browser change:', err);
  }
}

// Write to local storage (Asynchronous IndexedDB wrapper for speed)
async function saveToLocalAsync(data: AppData, modifiedKey?: keyof AppData) {
  try {
    if (modifiedKey) {
      await idb.set(modifiedKey, (data as any)[modifiedKey]);
    } else {
      for (const key of Object.keys(data)) {
        await idb.set(key, (data as any)[key]);
      }
    }
  } catch (e) {
    console.error('Failed to save to IndexedDB', e);
  }
}

function saveToLocal(data: AppData, skipBroadcast: boolean = false, modifiedKey?: keyof AppData) {
  // Fire and forget IndexedDB save (non-blocking)
  saveToLocalAsync(data, modifiedKey).catch(console.error);
  
  if (!skipBroadcast) {
    hasLocalDirtyState = true;
    lastLocalMutationTime = Date.now();
    broadcastDataChange(data);
  }
}

// Data is initialized via dataManager.initDB() asynchronously now
// currentData = loadFromLocal(); // REMOVED

// Restore local session if exists
try {
  const savedLocalSession = localStorage.getItem('otec_local_session');
  if (savedLocalSession) {
    localActiveUser = JSON.parse(savedLocalSession);
  }
} catch(e) {
  console.warn("Failed to restore local user session", e);
}

// Set up multi-browser listeners
if (typeof window !== 'undefined') {
  // 1. BroadcastChannel Listener (Instant same-domain tab-to-tab sync)
  if (multiBrowserChannel) {
    multiBrowserChannel.onmessage = (event) => {
      if (event.data && event.data.clientId !== TAB_CLIENT_ID && event.data.data) {
        console.log(`Received real-time update from secondary browser session (${event.data.clientId}).`);
        let incomingData = event.data.data as AppData;
        incomingData = migrateLowerPrimarySubjects(incomingData);
        
        const incomingStr = JSON.stringify(incomingData);
        const localStr = JSON.stringify(currentData);
        if (incomingStr !== localStr) {
          // Detect dirty state conflict
          if (hasLocalDirtyState) {
            console.warn('Multi-browser concurrency conflict detected! Local session has dirty unsaved state.');
            window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
              detail: {
                localData: JSON.parse(JSON.stringify(currentData)),
                incomingData,
                sourceName: `Secondary Browser Session (${event.data.clientId.slice(0, 12)}...)`,
                timestamp: new Date().toLocaleTimeString()
              }
            }));
            window.dispatchEvent(new CustomEvent('otec-toast', {
              detail: {
                message: 'Multi-Browser Concurrency Conflict: Simultaneous edits detected from secondary browser window! Side-by-side prompt opened.',
                type: 'warning'
              }
            }));
          } else {
            currentData = incomingData;
            saveToLocal(currentData, true); // Save locally without re-broadcasting back
            dataManager.triggerUpdate();

            window.dispatchEvent(new CustomEvent('otec-toast', {
              detail: {
                message: 'Multi-Browser Live Sync: Database synchronized with real-time edits from secondary browser window!',
                type: 'info'
              }
            }));
          }
        }
      }
    };
  }

  // 2. LocalStorage Event Listener (Fallback across tabs/windows)
  window.addEventListener('storage', (e) => {
    if (e.key === LOCAL_STORAGE_KEY || e.key === 'otec_last_broadcast_ts') {
      const freshData = loadFromLocal();
      const freshStr = JSON.stringify(freshData);
      const localStr = JSON.stringify(currentData);
      if (freshStr !== localStr) {
        if (hasLocalDirtyState) {
          console.warn('LocalStorage event detected dirty state concurrency conflict.');
          window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
            detail: {
              localData: JSON.parse(JSON.stringify(currentData)),
              incomingData: freshData,
              sourceName: 'Secondary Tab (LocalStorage Event)',
              timestamp: new Date().toLocaleTimeString()
            }
          }));
        } else {
          console.log('Storage event detected data mutation from another browser tab.');
          currentData = freshData;
          dataManager.triggerUpdate();

          window.dispatchEvent(new CustomEvent('otec-toast', {
            detail: {
              message: 'Multi-Browser Sync: Changes updated across browser tabs.',
              type: 'info'
            }
          }));
        }
      }
    }
  });

  // 3. Tab Visibility Listener (Refresh from server whenever returning to tab)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkServerDbVersion();
    }
  });

  // Periodic Background Polling for real-time cloud & multi-browser synchronization
  setInterval(() => {
    // Firestore handles real-time polling natively
  }, 3000);
}

// Check server DB version for changes made by different browsers/devices
async function checkServerDbVersion() {
  // Replaced by Firestore Realtime Sync
}

// Helper to save state to server workspace
async function syncWithWorkspaceServer(data: AppData) {
  // Replaced by Firestore
  return true;
}

// Helper to load state from server workspace
async function loadFromWorkspaceServer(forceApply: boolean = false) {
  // Replaced by Firestore
  return false;
}

// Real-time Firestore Sync Listener helper
function setupRealtimeListener(user: User) {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  
  if (!syncEnabled) return;
  
  const userDocRef = doc(db, 'users', user.uid, 'data', 'appState');
  unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
    if (!syncEnabled) return;
    
    // Ignore local updates before they hit the cloud
    if (docSnap.metadata.hasPendingWrites) {
      return;
    }
    
    if (docSnap.exists()) {
      let cloudData = docSnap.data() as AppData;
      cloudData = migrateLowerPrimarySubjects(cloudData);
      
      const cloudDataStr = JSON.stringify(cloudData);
      const currentDataStr = JSON.stringify(currentData);
      if (cloudDataStr !== currentDataStr) {
        console.log('Real-time sync: Received update from another device/browser.');
        if (hasLocalDirtyState) {
          window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
            detail: {
              localData: JSON.parse(JSON.stringify(currentData)),
              incomingData: cloudData,
              sourceName: 'Firebase Firestore Cloud Database',
              timestamp: new Date().toLocaleTimeString()
            }
          }));
        } else {
          currentData = cloudData;
          hasLocalDirtyState = false;
          saveToLocal(currentData, true);
          dataManager.triggerUpdate();
          
          // Notify user
          window.dispatchEvent(new CustomEvent('otec-modal-notify', {
            detail: {
              title: 'Live Sync Applied',
              message: 'Your school database was automatically updated with real-time changes from another browser.',
              type: 'success',
              timestamp: new Date().toLocaleString()
            }
          }));
        }
      }
    }
  }, (error: any) => {
    const isOffline = error && (error.code === 'unavailable' || error.message?.toLowerCase().includes('offline') || !navigator.onLine);
    if (isOffline) {
      console.info('Real-time sync snapshot listener suspended: Device offline.');
    } else {
      console.error('Real-time snapshot sync error:', error);
    }
  });
}

// Helper to recursively remove or replace undefined values for Firestore
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) {
    return null;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const result: any = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = sanitizeForFirestore(val);
    }
  }
  return result;
}

function getStudentTotalTermFees(student: Learner, settings: SchoolSettings): number {
  const hasDetailedFees = student.feeTuition !== undefined ||
                          student.feeBoarding !== undefined ||
                          student.feeVan !== undefined ||
                          student.feeRegistration !== undefined ||
                          student.feeSweater !== undefined ||
                          student.feeClassUniform !== undefined ||
                          student.feeSportsWear !== undefined ||
                          student.feeHair !== undefined ||
                          student.feeHoliday !== undefined ||
                          student.feeOthers !== undefined;

  if (hasDetailedFees) {
    return (student.feeTuition ?? 0) +
           (student.feeBoarding ?? 0) +
           (student.feeVan ?? 0) +
           (student.feeRegistration ?? 0) +
           (student.feeSweater ?? 0) +
           (student.feeClassUniform ?? 0) +
           (student.feeSportsWear ?? 0) +
           (student.feeHair ?? 0) +
           (student.feeHoliday ?? 0) +
           (student.feeOthers ?? 0);
  }

  // Fallback to settings defaults
  let tuition = settings.feeTuitionLower ?? 310000;
  const clsName = (student.cls || '').toUpperCase();
  if (['ZEBRA', 'LION', 'ELEPHANT', 'NURSERY', 'BABY', 'MIDDLE', 'PRE-PRIMARY', 'PREPRIMARY', 'KINDERGARTEN'].some(prefix => clsName.includes(prefix))) {
    tuition = settings.feeTuitionNursery ?? 290000;
  } else if (['P4', 'P5', 'P6', 'P7'].some(prefix => clsName.includes(prefix))) {
    tuition = settings.feeTuitionUpper ?? 335000;
  }

  const isBoarder = (student.dayBoarding || '').toLowerCase().includes('board');
  const boardingFee = isBoarder ? (settings.feeBoarding ?? 630000) : 0;
  const regFee = settings.feeRegistration ?? 20000;
  const sweaterFee = settings.feeSweater ?? 50000;
  const classUniformFee = settings.feeClassUniform ?? 50000;
  const sportsFee = settings.feeSportsWear ?? 70000;
  const hairFee = settings.feeHair ?? 5000;
  const holidayFee = settings.feeHoliday ?? 5000;
  const otherFee = settings.feeOthers ?? 0;
  const vanFee = 0;

  return tuition + boardingFee + regFee + sweaterFee + classUniformFee + sportsFee + hairFee + holidayFee + otherFee + vanFee;
}

const formatUGXLocal = (amount: number) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0
  }).format(amount);
};

export const dataManager = {
  // Initialize Database from IndexedDB (or fallback to old localStorage)
  async initDB(): Promise<AppData> {
    const keys = [
      'learners', 'scores', 'psychomotor', 'comments', 'settings', 'activityLog', 'auditLogs',
      'finances', 'security', 'transport', 'library', 'inventory', 'hostel',
      'timetable', 'clinic', 'discipline', 'extracurricular', 'hr', 'admissions',
      'procurement', 'communications'
    ];
    
    let data: Partial<AppData> = {};
    let isNew = true;
    
    try {
      for (const key of keys) {
        const val = await idb.get(key);
        if (val !== undefined) {
          (data as any)[key] = val;
          isNew = false;
        }
      }
    } catch (e) {
      console.warn('IndexedDB read failed, falling back', e);
    }

    if (isNew) {
      // Migrate from localStorage if exists
      console.log('Migrating from localStorage to IndexedDB...');
      data = loadFromLocal();
      await saveToLocalAsync(data as AppData);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // Ensure all top-level keys exist by merging with a fresh demo object
    const demoFallback = getDemoData();
    const safeData = { ...demoFallback, ...data } as AppData;

    // Specifically deep-merge settings because it contains critical nested config like authConfig and sections
    if (data.settings) {
      safeData.settings = { ...demoFallback.settings, ...data.settings };
      // Deep merge sections specifically
      if (data.settings.sections) {
        safeData.settings.sections = { ...demoFallback.settings.sections, ...data.settings.sections };
      } else {
        safeData.settings.sections = demoFallback.settings.sections;
      }
      // Ensure examSets exists
      if (!data.settings.examSets) {
        safeData.settings.examSets = demoFallback.settings.examSets;
      }
    }

    currentData = migrateLowerPrimarySubjects(safeData);
    return currentData;
  },

  // Get current state
  getData(): AppData {
    return currentData;
  },

  // Set the full state
  setData(newData: AppData) {
    currentData = migrateLowerPrimarySubjects(newData);
    saveToLocal(currentData);
    this.triggerUpdate();
    this.syncWithCloud();
  },

  // Add a system log entry
  addActivityLog(type: ActivityLog['type'], details: string, operator?: string) {
    if (!currentData.activityLog) {
      currentData.activityLog = [];
    }
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      type,
      details,
      operator: operator || (activeUser?.email ? activeUser.email.split('@')[0] : 'Teacher')
    };
    currentData.activityLog = [newLog, ...currentData.activityLog].slice(0, 50); // Keep last 50 entries
    saveToLocal(currentData);
    this.triggerUpdate();
    this.syncWithCloud();
  },

  // Modify specific aspects
  saveAuditLog(log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userName'>) {
    if (!currentData.auditLogs) {
      currentData.auditLogs = [];
    }
    const newLog: AuditLog = {
      id: 'audit-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      userId: activeUser?.uid || 'system',
      userName: activeUser?.displayName || activeUser?.email || 'System Admin',
      ...log
    };
    currentData.auditLogs = [newLog, ...currentData.auditLogs].slice(0, 1000); // Keep last 1000 entries
    saveToLocal(currentData, false, 'auditLogs');
    this.triggerUpdate();
    this.syncWithCloud(true, 'audit_logged', 'auditLogs');
  },

  updateVendors(vendors: Vendor[]) {
    currentData.vendors = vendors;
    saveToLocal(currentData, false, 'vendors');
    this.triggerUpdate();
    this.syncWithCloud(true, 'vendors_updated', 'vendors');
  },

  updateVendorInvoices(invoices: VendorInvoice[]) {
    currentData.vendorInvoices = invoices;
    saveToLocal(currentData, false, 'vendorInvoices');
    this.triggerUpdate();
    this.syncWithCloud(true, 'vendorInvoices_updated', 'vendorInvoices');
  },

  updateRequisitions(requisitions: PettyCashRequisition[]) {
    currentData.requisitions = requisitions;
    saveToLocal(currentData, false, 'requisitions');
    this.triggerUpdate();
    this.syncWithCloud(true, 'requisitions_updated', 'requisitions');
  },

  updateSettings(settings: SchoolSettings) {
    currentData.settings = settings;
    saveToLocal(currentData, false, 'settings');
    this.triggerUpdate();
    this.syncWithCloud(true, 'settings_updated', 'settings');
    this.addActivityLog('settings_modified', `School configurations updated for term ${settings.term} (${settings.schoolName}).`);
  },

  updateLearners(learners: Learner[]) {
    // Keep a map of previous outstanding balances of existing learners
    const prevBalances = new Map<string, number>();
    currentData.learners.forEach(l => {
      prevBalances.set(l.id, parseFloat(l.outstandingBalance || '0'));
    });

    // Save the new learners
    currentData.learners = regenerateUNEBNumbers(learners);
    saveToLocal(currentData, false, 'learners');
    this.triggerUpdate();
    this.syncWithCloud(true, 'learners_updated', 'learners');

    // Check for students whose balance fell below 20% of total term fees
    currentData.learners.forEach(student => {
      const prevBal = prevBalances.get(student.id);
      const newBal = parseFloat(student.outstandingBalance || '0');
      
      const totalFees = getStudentTotalTermFees(student, currentData.settings);
      const threshold = 0.20 * totalFees;

      // Condition: transition from >= 20% to < 20% of total fees
      if (prevBal !== undefined && prevBal >= threshold && newBal < threshold) {
        window.dispatchEvent(new CustomEvent('otec-toast', {
          detail: {
            message: `Student Balance Notice: ${student.name}'s remaining arrears (${formatUGXLocal(newBal)}) has fallen below 20% of their total term fees (${formatUGXLocal(totalFees)}).`,
            type: 'info'
          }
        }));
      }
    });
  },

  updateScores(compositeKey: string, scoreRecord: ScoreRecord) {
    currentData.scores[compositeKey] = scoreRecord;
    
    // Immediate validation check for invalid mark ranges (0-100)
    if (scoreRecord && typeof scoreRecord === 'object') {
      Object.entries(scoreRecord).forEach(([subject, val]) => {
        if (val !== undefined && val !== null && (val as any) !== '') {
          const num = Number(val);
          if (isNaN(num) || num < 0 || num > 100) {
            const [learnerId] = compositeKey.split('|');
            const learner = (currentData.learners || []).find(l => l.id === learnerId);
            const learnerName = learner ? learner.name : 'Learner';

            window.dispatchEvent(
              new CustomEvent('otec-modal-notify', {
                detail: {
                  title: '⚠️ Invalid Mark Range Detected',
                  message: `Invalid mark "${val}" entered for ${learnerName} in ${subject}. Marks must be between 0 and 100.`,
                  type: 'error',
                  timestamp: new Date().toLocaleTimeString()
                }
              })
            );
          }
        }
      });
    }

    saveToLocal(currentData, false, 'scores');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'scores');
  },

  updatePsychomotor(compositeKey: string, psychoRecord: PsychomotorRecord) {
    currentData.psychomotor[compositeKey] = psychoRecord;
    saveToLocal(currentData, false, 'psychomotor');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'psychomotor');
  },

  updateComments(compositeKey: string, commentRecord: CommentRecord) {
    currentData.comments[compositeKey] = commentRecord;
    saveToLocal(currentData, false, 'comments');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'comments');
  },

  updateFinances(finances: FinanceTransaction[]) {
    currentData.finances = finances;
    saveToLocal(currentData, false, 'finances');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'finances');
  },

  updateBankAccounts(bankAccounts: BankAccount[]) {
    currentData.bankAccounts = bankAccounts;
    saveToLocal(currentData, false, 'bankAccounts');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'bankAccounts');
  },

  updateBankTransfers(bankTransfers: BankTransfer[]) {
    currentData.bankTransfers = bankTransfers;
    saveToLocal(currentData, false, 'bankTransfers');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'bankTransfers');
  },


  updateSecurityData(security: SecurityData) {
    currentData.security = security;
    saveToLocal(currentData, false, 'security');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'security');
  },

  updateTransportData(transport: TransportData) {
    currentData.transport = transport;
    saveToLocal(currentData, false, 'transport');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'transport');
  },

  updateLibraryData(library: LibraryData) {
    currentData.library = library;
    saveToLocal(currentData, false, 'library');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'library');
  },

  updateInventoryData(inventory: InventoryData) {
    currentData.inventory = inventory;
    saveToLocal(currentData, false, 'inventory');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'inventory');
  },

  updateHostelData(hostel: HostelData) {
    currentData.hostel = hostel;
    saveToLocal(currentData, false, 'hostel');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'hostel');
  },

  updateTimetableData(timetable: TimetableData) {
    currentData.timetable = timetable;
    saveToLocal(currentData, false, 'timetable');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'timetable');
  },

  updateClinicData(clinic: ClinicData) {
    currentData.clinic = clinic;
    saveToLocal(currentData, false, 'clinic');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'clinic');
  },

  updateDisciplineData(discipline: DisciplineData) {
    currentData.discipline = discipline;
    saveToLocal(currentData, false, 'discipline');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'discipline');
  },

  updateExtracurricularData(extracurricular: ExtracurricularData) {
    currentData.extracurricular = extracurricular;
    saveToLocal(currentData, false, 'extracurricular');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'extracurricular');
  },

  updateAdmissionsData(admissions: AdmissionsData) {
    currentData.admissions = admissions;
    saveToLocal(currentData, false, 'admissions');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'admissions');
  },

  updateProcurementData(procurement: ProcurementData) {
    currentData.procurement = procurement;
    saveToLocal(currentData, false, 'procurement');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'procurement');
  },

  updateCommunicationsData(communications: CommunicationsData) {
    currentData.communications = communications;
    saveToLocal(currentData, false, 'communications');
    this.triggerUpdate();
    this.syncWithCloud(false, 'data_mutation', 'communications');
  },

  // Clear everything and load demo
  resetToDefaults() {
    currentData = getDemoData();
    saveToLocal(currentData, false, 'communications');
    this.addActivityLog('reset_defaults', 'Database cleared and reset to system demo defaults.');
  },

  // Wipe EVERYTHING to start fresh with real data
  wipeAllData() {
    currentData = {
      learners: [],
      scores: {},
      psychomotor: {},
      comments: {},
      settings: currentData.settings, // Keep settings like grading bands
      finances: [],
      security: { gateLogs: [], visitors: [] },
      transport: { routes: [], allocations: [] },
      library: { books: [], issues: [] },
      inventory: { assets: [] },
      hostel: { dormitories: [], allocations: [] },
      timetable: { slots: [] },
      clinic: { records: {}, visits: [] },
      discipline: { incidents: [] },
      extracurricular: { clubs: [], memberships: [] }
    };
    saveToLocal(currentData, false, 'communications');
    this.addActivityLog('wipe_data', 'Database wiped clean for fresh real data entry.');
  },

  // State changes subscription
  subscribe(callback: () => void) {
    onStateChangeCallbacks.push(callback);
    return () => {
      onStateChangeCallbacks = onStateChangeCallbacks.filter(cb => cb !== callback);
    };
  },

  triggerUpdate() {
    onStateChangeCallbacks.forEach(cb => cb());
  },

  getSyncStatus() {
    if (!syncEnabled) return 'offline';
    return syncStatus;
  },

  getLastSyncedTime() {
    return localStorage.getItem('otec_last_synced') || null;
  },

  getActiveUser() {
    return activeUser;
  },

  getLocalActiveUser() {
    return localActiveUser;
  },

  setLocalActiveUser(user: any) {
    localActiveUser = user;
    if (user) {
      localStorage.setItem('otec_local_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('otec_local_session');
    }
    this.triggerUpdate();
  },

  isSyncEnabled() {
    return syncEnabled;
  },

  setSyncEnabled(enabled: boolean) {
    syncEnabled = enabled;
    localStorage.setItem('otec_sync_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      if (activeUser) {
        setupRealtimeListener(activeUser);
      }
      syncStatus = 'syncing';
      this.triggerUpdate();
      this.syncWithCloud(false, 'data_mutation', 'communications');
    } else {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      syncStatus = 'offline';
      this.triggerUpdate();
    }
  },

  // Get latest sync performance metrics
  getLastSyncMetric(): SyncMetric {
    return lastSyncMetrics;
  },

  getSyncHistory(): SyncMetric[] {
    return syncMetricsHistory;
  },

  async forceSync() {
    return this.syncWithCloud(true, 'manual_force', 'communications');
  },

  // Dirty State Management
  isDirty() {
    return hasLocalDirtyState;
  },

  markDirty() {
    hasLocalDirtyState = true;
    lastLocalMutationTime = Date.now();
  },

  clearDirty() {
    hasLocalDirtyState = false;
  },

  // Resolve multi-browser / cloud concurrency conflict
  resolveConflict(choice: 'local' | 'incoming' | 'merge', resolvedData?: AppData) {
    if (choice === 'local') {
      hasLocalDirtyState = false;
      saveToLocal(currentData, false, 'communications');
      this.syncWithCloud(true, 'conflict_resolve_local', 'communications');
    } else if (choice === 'incoming' && resolvedData) {
      hasLocalDirtyState = false;
      currentData = migrateLowerPrimarySubjects(resolvedData);
      saveToLocal(currentData, true, 'communications');
      this.triggerUpdate();
    } else if (choice === 'merge' && resolvedData) {
      hasLocalDirtyState = false;
      currentData = migrateLowerPrimarySubjects(resolvedData);
      saveToLocal(currentData, false, 'communications');
      this.triggerUpdate();
      this.syncWithCloud(true, 'conflict_resolve_merge', 'communications');
    }
  },

  // Simulate a multi-browser concurrency conflict with side-by-side modal
  simulateMultiBrowserConflict(sourceBrowserName: string = "Secondary Staff Terminal (Chrome)") {
    hasLocalDirtyState = true;
    const incomingData: AppData = JSON.parse(JSON.stringify(currentData));
    
    // Add a remote learner or remote score entry to create a realistic conflict
    if (!incomingData.learners) incomingData.learners = [];
    const simulatedRemoteLearner: Learner = {
      id: 'conflict-sim-' + Math.random().toString(36).slice(2, 7),
      admNo: 'OTEC/' + Math.floor(1000 + Math.random() * 8999),
      name: 'Simulated Remote Learner (' + sourceBrowserName.split(' ')[0] + ')',
      cls: incomingData.learners[0]?.cls || 'P.7',
      sex: 'Male',
      age: '12',
      outstandingBalance: '150000',
      guardianPhone: '+256700112233'
    };
    incomingData.learners = [simulatedRemoteLearner, ...incomingData.learners];

    window.dispatchEvent(new CustomEvent('otec-sync-conflict', {
      detail: {
        localData: JSON.parse(JSON.stringify(currentData)),
        incomingData,
        sourceName: sourceBrowserName,
        timestamp: new Date().toLocaleTimeString()
      }
    }));

    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: 'Multi-Browser Concurrency Conflict Triggered: Opening side-by-side comparison modal!',
        type: 'warning'
      }
    }));
  },

  // Populate / Simulate changes coming from a secondary browser session
  simulateMultiBrowserMutation(sourceBrowserName: string = "Secondary Chrome Browser (Staff Terminal)") {
    if (!currentData.activityLog) currentData.activityLog = [];
    const simulatedLog: ActivityLog = {
      id: 'mb-' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
      type: 'scores_recorded',
      details: `Live scores and ledger data broadcast received from ${sourceBrowserName} (Session ID: ${TAB_CLIENT_ID.slice(0, 10)}...).`,
      operator: 'Remote User'
    };
    currentData.activityLog = [simulatedLog, ...currentData.activityLog].slice(0, 50);
    
    saveToLocal(currentData, false, 'communications');
    this.triggerUpdate();
    this.syncWithCloud(true, 'multi_browser_sim', 'communications');
    
    window.dispatchEvent(new CustomEvent('otec-toast', {
      detail: {
        message: `Multi-Browser Event Broadcasted: Live changes sent from ${sourceBrowserName}!`,
        type: 'success'
      }
    }));
  },

  // Sync state to Firebase Firestore & Workspace Cloud Server
  async syncWithCloud(force: boolean = false, triggerReason: string = 'data_mutation', modifiedKey?: keyof AppData) {
    if (!syncEnabled) {
      syncStatus = 'offline';
      this.triggerUpdate();
      return;
    }

    const currentStr = JSON.stringify(currentData);
    const payloadKb = Math.round((new Blob([currentStr]).size / 1024) * 10) / 10;

    // Incremental check: sync ONLY if new data is entered in the browser (unless forced)
    if (!force && lastSyncedDataHash && currentStr === lastSyncedDataHash) {
      const cachedMetric: SyncMetric = {
        id: 'sm-' + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationMs: 0,
        payloadKb,
        status: 'cached',
        trigger: triggerReason,
        details: 'Sync skipped: Data unchanged in browser (cached)'
      };
      lastSyncMetrics = cachedMetric;
      syncStatus = 'synced';
      this.triggerUpdate();
      
      window.dispatchEvent(new CustomEvent('otec-sync-metric', { detail: cachedMetric }));
      return;
    }

    const startTime = performance.now();

    try {
      syncStatus = 'syncing';
      this.triggerUpdate();

      // Always save to standard Workspace server storage
      await syncWithWorkspaceServer(currentData);

      // Silent clone to Google Drive if connected
      silentSyncToGoogleDrive(currentData).catch(err => {
        console.warn('Silent auto-sync to Google Drive deferred:', err);
      });

      if (activeUser) {
        const userDocRef = doc(db, 'users', activeUser.uid, 'data', 'appState');
        if (modifiedKey) {
          await setDoc(userDocRef, { [modifiedKey]: sanitizeForFirestore((currentData as any)[modifiedKey]) }, { merge: true });
        } else {
          await setDoc(userDocRef, sanitizeForFirestore(currentData));
        }
      }

      const durationMs = Math.round(performance.now() - startTime);
      lastSyncedDataHash = currentStr;
      
      const successMetric: SyncMetric = {
        id: 'sm-' + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationMs,
        payloadKb,
        status: 'synced',
        trigger: triggerReason,
        details: `Successfully synced ${payloadKb} KB in ${durationMs}ms`
      };

      lastSyncMetrics = successMetric;
      syncMetricsHistory = [successMetric, ...syncMetricsHistory].slice(0, 30);
      localStorage.setItem('otec_sync_metrics_history', JSON.stringify(syncMetricsHistory));

      syncStatus = 'synced';
      localStorage.setItem('otec_last_synced', new Date().toISOString());
      this.triggerUpdate();

      window.dispatchEvent(new CustomEvent('otec-sync-metric', { detail: successMetric }));
    } catch (e: any) {
      const durationMs = Math.round(performance.now() - startTime);
      const isOffline = e && (e.code === 'unavailable' || e.message?.toLowerCase().includes('offline') || !navigator.onLine);
      
      const errorMetric: SyncMetric = {
        id: 'sm-' + Math.random().toString(36).slice(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        durationMs,
        payloadKb,
        status: isOffline ? 'offline' : 'error',
        trigger: triggerReason,
        details: isOffline ? 'Device offline: Changes cached locally' : `Sync failed: ${e.message || 'Unknown network error'}`
      };

      lastSyncMetrics = errorMetric;
      syncMetricsHistory = [errorMetric, ...syncMetricsHistory].slice(0, 30);
      localStorage.setItem('otec_sync_metrics_history', JSON.stringify(syncMetricsHistory));

      if (isOffline) {
        console.info('Cloud sync deferred: Device is currently offline.');
        syncStatus = 'offline';
      } else {
        console.error('Error syncing with cloud', e);
        syncStatus = 'error';
      }
      this.triggerUpdate();

      window.dispatchEvent(new CustomEvent('otec-sync-metric', { detail: errorMetric }));
    }
  },

  logAuditAction(
    moduleName: 'Finance' | 'Academics' | 'HR' | 'Security' | 'System' | 'Hostel' | 'Transport' | 'Library' | 'Inventory' | 'Admissions' | 'Communications' | 'Procurement',
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    recordId: string,
    details: string,
    previousValue?: any,
    newValue?: any
  ) {
    if (!currentData.auditLogs) currentData.auditLogs = [];
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      userId: activeUser?.uid || 'system',
      userName: activeUser?.displayName || activeUser?.email || 'System User',
      module: moduleName,
      action,
      recordId,
      details,
      previousValue,
      newValue
    };
    currentData.auditLogs = [newLog, ...currentData.auditLogs].slice(0, 1000); // Keep last 1000 entries
    saveToLocal(currentData, true, 'communications');
    this.triggerUpdate();
  },

  // Initialize Auth Listening
  initAuthListener() {
    // Load from workspace server on startup
    if (syncEnabled) {
      loadFromWorkspaceServer(true);

      // Silent Auto-restore from Google Drive if token is active
      autoRestoreFromGoogleDrive().then(driveData => {
        if (driveData && driveData.learners) {
          const migrated = migrateLowerPrimarySubjects(driveData);
          currentData = migrated;
          saveToLocal(currentData, false, 'communications');
          dataManager.triggerUpdate();
          
          window.dispatchEvent(new CustomEvent('otec-modal-notify', {
            detail: {
              title: 'Google Drive Auto-Restore',
              message: 'Restored latest cloud database backup from Google Drive automatically.',
              type: 'success',
              timestamp: new Date().toLocaleString()
            }
          }));
        }
      });
    }

    onAuthStateChanged(auth, async (user) => {
      activeUser = user;
      if (user) {
        localStorage.removeItem('otec_manually_signed_out');
        
        if (syncEnabled) {
          syncStatus = 'syncing';
          this.triggerUpdate();
          setupRealtimeListener(user);

          try {
            const userDocRef = doc(db, 'users', user.uid, 'data', 'appState');
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
              // Load cloud state
              let cloudData = docSnap.data() as AppData;
              cloudData = migrateLowerPrimarySubjects(cloudData);
              currentData = cloudData;
              saveToLocal(currentData, false, 'communications');
              syncStatus = 'synced';
              localStorage.setItem('otec_last_synced', new Date().toISOString());
            } else {
              // Document doesn't exist in cloud, upload current local state
              currentData = migrateLowerPrimarySubjects(currentData);
              await setDoc(userDocRef, sanitizeForFirestore(currentData));
              syncStatus = 'synced';
              localStorage.setItem('otec_last_synced', new Date().toISOString());
            }
          } catch (e: any) {
            const isOffline = e && (e.code === 'unavailable' || e.code === 'failed-precondition' || e.message?.toLowerCase().includes('offline') || !navigator.onLine);
            if (isOffline) {
              console.info('Operating in offline mode. Local-first data will sync when connectivity is restored.');
              syncStatus = 'offline';
            } else {
              console.error('Error fetching user data from firestore', e);
              syncStatus = 'error';
            }
            this.triggerUpdate();
          }
        } else {
          syncStatus = 'offline';
        }
      } else {
        syncStatus = 'offline';
        
        // Auto-login with admin/admin1234 if not manually signed out
        const manuallySignedOut = localStorage.getItem('otec_manually_signed_out');
        if (!manuallySignedOut) {
          try {
            syncStatus = 'syncing';
            this.triggerUpdate();
            // Silent admin login using mapped address
            await signInWithEmailAndPassword(auth, 'admin@otec-reportcards.local', 'admin1234');
          } catch (err: any) {
            if (err.code === 'auth/operation-not-allowed') {
              // Email/Password sign-in is disabled. Let's try Anonymous authentication as fallback
              try {
                await signInAnonymously(auth);
                console.log('Firebase Cloud Auth: Silent anonymous session established successfully.');
              } catch (anonErr: any) {
                syncStatus = 'offline';
                this.triggerUpdate();
                console.info('Firebase Cloud Auth: Operating in offline local-only storage mode.', anonErr.message);
              }
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
              try {
                await createUserWithEmailAndPassword(auth, 'admin@otec-reportcards.local', 'admin1234');
              } catch (regErr: any) {
                if (regErr.code === 'auth/operation-not-allowed') {
                  try {
                    await signInAnonymously(auth);
                  } catch (anonErr2: any) {
                    syncStatus = 'offline';
                    this.triggerUpdate();
                    console.info('Firebase Cloud Auth: Registration/Anonymous disabled. Using offline local-only storage.');
                  }
                } else {
                  console.warn('Silent admin registration deferred:', regErr.message);
                }
              }
            } else {
              syncStatus = 'offline';
              this.triggerUpdate();
              console.warn('Silent login deferred:', err.message);
            }
          }
        }
      }
      this.triggerUpdate();
    });
  }
};

// Function to flush and save updated database state when closing or leaving the app
function saveOnAppClose() {
  try {
    saveToLocal(currentData, true, 'communications');
    // Firestore handles offline caching automatically on writes
    console.log('App closing: Updated data saved to local storage/Firestore offline cache.');
  } catch (err) {
    console.warn('App close save deferred:', err);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', saveOnAppClose);
  window.addEventListener('pagehide', saveOnAppClose);
}

// Initialize auth listener and sync state on initial page load
dataManager.initAuthListener();
loadFromWorkspaceServer(true);

export default dataManager;
export { activeUser, syncStatus, saveOnAppClose };
