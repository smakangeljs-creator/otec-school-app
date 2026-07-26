export type Sex = 'Male' | 'Female';

export interface Learner {
  id: string;
  name: string;
  admNo: string;
  sex: Sex;
  age: string;
  cls: string;
  paycode?: string;
  lin?: string;
  photo?: string;
  archived?: boolean;
  // Additional Excel Fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  studentAccount?: string;
  studentPhone?: string;
  active?: string;
  studentEmail?: string;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  outstandingBalance?: string;
  dayBoarding?: string;
  suiteCode?: string;
  unebNo?: string;
  // Individual learner fee components
  feeTuition?: number;
  feeBoarding?: number;
  feeVan?: number;
  feeRegistration?: number;
  feeSweater?: number;
  feeClassUniform?: number;
  feeSportsWear?: number;
  feeHair?: number;
  feeHoliday?: number;
  feeOthers?: number;
}

export interface Subject {
  name: string;
  max: number;
}

export interface GradingBand {
  min: number;
  max: number;
  grade: string;
  remark: string;
  classComments: string[];
  headComments: string[];
}

export interface SectionConfig {
  subjects: Subject[];
  grading: GradingBand[];
}

export interface ExamSet {
  id: string;
  label: string;
  term: string; // 'Term 1' | 'Term 2' | 'Term 3'
  period: 'BOT' | 'MOT' | 'EOT';
  setNo: number;
  classes: string[];
}

export interface ClassTeacher {
  name: string;
  initials: string;
}

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  phone?: string;
  email?: string;
  specialization?: string;
}

export interface PLEOverrideConfig {
  enabled: boolean;
  englishMinGradeForDiv1: number; // e.g. 6 (C6) - index-based where D1=1, D2=2, C3=3, C4=4, C5=5, C6=6, P7=7, P8=8, F9=9
  mathMinGradeForDiv1: number;    // e.g. 6 (C6)
  englishMinGradeForDiv2: number; // e.g. 8 (P8)
  mathMinGradeForDiv2: number;    // e.g. 8 (P8)
  requireAllCoreSubjects: boolean; // Must have all 4 core subjects to get any division
}

export interface ReportCardVisibility {
  showTeacherComments: boolean;
  showPsychomotor: boolean;
  showRankingTable: boolean;
  showDivision: boolean;
  showStudentPhoto?: boolean;
  showGradingScale?: boolean;
  showSchoolLogo?: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // 'YYYY-MM-DD'
  type: 'event' | 'deadline' | 'holiday';
  description?: string;
}

export type SystemRole = 'superuser' | 'accountant' | 'security' | 'teacher';

export interface SystemUserAccount {
  id: string;
  username: string; // 'admin', 'accountant', 'security', 'teacher' or custom
  name: string;
  role: SystemRole;
  pinOrPassword: string;
  active: boolean;
  avatarUrl?: string;
  createdAt: string;
  lastLoginTime?: string;
  assignedTeacherName?: string;
}

export interface AuthAccessConfig {
  requireLoginOnStartup: boolean;
  users: SystemUserAccount[];
}

export interface SchoolSettings {
  schoolName: string;
  shortName: string;
  motto: string;
  address: string;
  tel1: string;
  tel2: string;
  logo: string; // base64
  term: string; // 'Term 1' | 'Term 2' | 'Term 3'
  year: number;
  termStartDate?: string;
  termEndDate?: string;
  headTeacherName: string;
  headTeacherInitials: string;
  psychomotor: string[];
  sections: {
    preprimary: SectionConfig;
    lower: SectionConfig;
    upper: SectionConfig;
  };
  examSets: ExamSet[];
  classTeachers: { [className: string]: ClassTeacher };
  pleOverride: PLEOverrideConfig;
  teachersList?: Teacher[];
  reportCardVisibility?: ReportCardVisibility;
  calendarEvents?: CalendarEvent[];
  ledgerDayFees?: number;
  ledgerBoardingFees?: number;
  ledgerAutoDeduct?: boolean;
  ledgerCurrency?: string;
  // School-level default fees configurations
  feeTuitionLower?: number;
  feeTuitionNursery?: number;
  feeTuitionUpper?: number;
  feeBoarding?: number;
  feeVanMin?: number;
  feeVanMax?: number;
  feeRegistration?: number;
  feeSweater?: number;
  feeClassUniform?: number;
  feeSportsWear?: number;
  feeHair?: number;
  feeHoliday?: number;
  feeOthers?: number;
  // User Access & Auth Configuration
  authConfig?: AuthAccessConfig;
}

export interface ScoreRecord {
  [subjectName: string]: number; // subject name -> mark out of max
}

export interface PsychomotorRecord {
  [skillName: string]: number; // skill -> rating (1-5)
}

export interface CommentRecord {
  teacher: string;
  head: string;
  teacherInitials: string;
  headInitials: string;
  nextTermBegins?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'report_printed' | 'data_imported' | 'settings_modified' | 'scores_recorded' | 'student_created' | 'reset_defaults' | 'finance_modified' | 'gate_accessed' | 'visitor_registered' | 'security_alarm';
  details: string;
  operator: string;
}

export type SecurityPersonType = 'Student' | 'Teacher' | 'Visitor' | 'Unknown';
export type SecurityGateStatus = 'Locked' | 'Unlocked' | 'Emergency_Open' | 'Emergency_Lock';

export interface GateLogEntry {
  id: string;
  timestamp: string; // ISO string
  personType: SecurityPersonType;
  personName: string;
  personId?: string; // Student ID, Teacher ID, or Visitor ID
  classOrDepartment?: string;
  photoUrl?: string;
  verificationMethod: 'Face Recognition' | 'Fingerprint (ZKTeco)' | 'RFID Card' | 'QR Code' | 'Manual Guard Approval' | 'Unrecognized';
  gateUsed: string; // e.g. "Main Gate - Gate A"
  direction: 'Entry' | 'Exit';
  status: 'Present' | 'Late' | 'Left' | 'Approved' | 'Overdue' | 'Alarm_Triggered';
  notes?: string;
  parentNotified?: boolean;
  workHoursLogged?: number;
  temperatureCelsius?: number;
  livenessConfidence?: number; // e.g. 98.5
}

export interface VisitorRecord {
  id: string;
  visitorName: string;
  phone: string;
  nationalId: string;
  company?: string;
  purpose: string;
  hostTeacherName: string;
  vehicleNumber?: string;
  badgeNumber: string;
  qrCode: string;
  photoUrl?: string;
  arrivalTime: string;
  expectedDepartureTime: string; // ISO or HH:MM
  actualDepartureTime?: string;
  status: 'Inside School' | 'Exited' | 'Overdue';
  durationMinutes?: number;
  approvedByGuard: string;
}

export interface UnknownPersonAlert {
  id: string;
  timestamp: string;
  gateUsed: string;
  snapshotUrl?: string;
  alarmActive: boolean;
  reason: 'Unrecognized Face & Fingerprint' | 'Anti-Spoofing Failure' | 'Tailgating Detected' | 'Forced Entry Attempt';
  status: 'Active Alarm' | 'Resolved' | 'Investigating';
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  loggedBy: string;
  notes?: string;
}

export interface SecurityGateSystemConfig {
  gateState: SecurityGateStatus;
  autoOpenForStudents: boolean;
  autoOpenForTeachers: boolean;
  notifyParentsOnEntry: boolean;
  notifyParentsOnExit: boolean;
  livenessDetectionEnabled: boolean;
  antiSpoofingEnabled: boolean;
  tailgatingAlarmEnabled: boolean;
  hikvisionCamConnected: boolean;
  zktecoScannerConnected: boolean;
  relayControllerOnline: boolean;
  activeGateName: string;
}

export interface SecurityData {
  gateLogs: GateLogEntry[];
  visitors: VisitorRecord[];
  unknownAlerts: UnknownPersonAlert[];
  config: SecurityGateSystemConfig;
}

export interface FinanceTransaction {
  id: string;
  date: string; // 'YYYY-MM-DD'
  type: 'income' | 'expense';
  category: string; // 'Tuition Fees', 'Boarding Fees', 'Uniforms', 'Stationery', 'Teacher Salaries', 'Food & Meals', 'Maintenance', 'Utilities', 'Other'
  amount: number;
  studentId?: string; // Optional linked student for fee payments
  description: string;
  recordedBy: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
  paymentMode?: string;
  receiptNo?: string;
  title?: string;
  payerOrPayee?: string;
  term?: string; // 'Term 1' | 'Term 2' | 'Term 3'
}

export interface AppData {
  learners: Learner[];
  scores: { [compositeKey: string]: ScoreRecord }; // "learnerId|examSetId" -> ScoreRecord
  psychomotor: { [compositeKey: string]: PsychomotorRecord }; // "learnerId|examSetId" -> PsychomotorRecord
  comments: { [compositeKey: string]: CommentRecord }; // "learnerId|examSetId" -> CommentRecord
  settings: SchoolSettings;
  activityLog?: ActivityLog[];
  finances?: FinanceTransaction[];
  security?: SecurityData;
}
