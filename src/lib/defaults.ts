import { SchoolSettings, Learner, ScoreRecord, PsychomotorRecord, CommentRecord, AppData, GradingBand, FinanceTransaction, SecurityData, SystemUserAccount } from '../types';
import { getSeededLearners } from './seededLearners';

export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

export const PERIODS = [
  { code: 'BOT', label: 'Beginning of Term' },
  { code: 'MOT', label: 'Mid Term' },
  { code: 'EOT', label: 'End of Term' }
] as const;

export const SECTIONS = {
  preprimary: {
    label: 'Pre-Primary (Nursery)',
    classes: ['ZEBRA', 'LION', 'ELEPHANT']
  },
  lower: {
    label: 'Lower Primary',
    classes: ['P1', 'P2', 'P3']
  },
  upper: {
    label: 'Upper Primary',
    classes: ['P4', 'P5', 'P6', 'P7']
  }
} as const;

export const ALL_CLASSES = [
  'ZEBRA', 'LION', 'ELEPHANT',
  'P1', 'P2', 'P3',
  'P4', 'P5', 'P6', 'P7'
];

export function sectionKeyOfClass(cls: string): 'preprimary' | 'lower' | 'upper' {
  if (SECTIONS.preprimary.classes.includes(cls as any)) return 'preprimary';
  if (SECTIONS.lower.classes.includes(cls as any)) return 'lower';
  return 'upper';
}

export function defaultGradingBands() {
  return [
    { min: 80, max: 100, grade: 'D1', remark: 'Excellent', classComments: ['Shows excellent understanding and active participation.', 'An outstanding performance this term. Keep it up.'], headComments: ['A truly outstanding result. Well done.', 'Excellent performance; a role model to peers.'] },
    { min: 75, max: 79, grade: 'D2', remark: 'Very Good', classComments: ['Very good performance with consistent effort.', 'A brilliant result; keep up the high standard.'], headComments: ['A very good result overall. Keep working hard.', 'Demonstrates great potential and commitment.'] },
    { min: 70, max: 74, grade: 'C3', remark: 'Good', classComments: ['Good progress; should practice more to improve further.', 'A commendable effort. Well done.'], headComments: ['A good result. Aim even higher next term.', 'Satisfactory performance; keep aspiring for greatness.'] },
    { min: 65, max: 69, grade: 'C4', remark: 'Fairly Good', classComments: ['Fairly good work; more consistency is needed.', 'Shows interest in lessons. Good try.'], headComments: ['Fairly good performance; more effort is encouraged.', 'Steady progress made. Work for better results next term.'] },
    { min: 60, max: 64, grade: 'C5', remark: 'Average', classComments: ['Average performance; needs more practice at home.', 'A solid effort. There is room for improvement.'], headComments: ['An average result; more effort is required.', 'Encourage steady reading and practice at home.'] },
    { min: 55, max: 59, grade: 'C6', remark: 'Pass', classComments: ['A pass grade; needs to improve consistency in written work.', 'Capable of better results with focus.'], headComments: ['A pass; please encourage more reading and practice at home.', 'With more concentration, a higher grade can be achieved.'] },
    { min: 50, max: 54, grade: 'P7', remark: 'Weak Pass', classComments: ['A weak pass; extra practice is strongly recommended.', 'Finds some concepts challenging. Needs revision.'], headComments: ['Needs to put in a lot more effort next term.', 'Extra coaching and supportive practice are advised.'] },
    { min: 45, max: 49, grade: 'P8', remark: 'Poor', classComments: ['Poor performance; needs close guidance and support.', 'Struggling with standard classroom work.'], headComments: ['Performance is below expectation; needs close support at home.', 'Remedial assistance is strongly recommended.'] },
    { min: 0, max: 44, grade: 'F9', remark: 'Fail', classComments: ['Needs to improve consistency in written work.', 'Requires urgent extra support and remedial practice.'], headComments: ['A concerning result; parents and guardians should engage the school urgently.', 'Remedial support is highly critical at this stage.'] }
  ];
}

export function defaultPrePrimaryGradingBands(): GradingBand[] {
  return [
    { 
      min: 80, 
      max: 100, 
      grade: 'A+', 
      remark: 'AWARD A+', 
      classComments: [
        'An exceptionally brilliant young learner! Showcases marvelous competence in numbers and writing.',
        'Displays incredible creativity in drawing and reading. Always active, obedient, and eager to learn.',
        'A fantastic term! Speaks English with wonderful confidence and leads peer activities beautifully.'
      ], 
      headComments: [
        'An outstanding foundation for future academic success. Truly exceptional progress!',
        'An exemplary young scholar who continues to set a wonderful standard. Keep up the brilliant spirit.',
        'Impressive work! Demonstrates brilliant development in all learning domains.'
      ] 
    },
    { 
      min: 60, 
      max: 79, 
      grade: 'VERY GOOD', 
      remark: 'AWARD VERY GOOD', 
      classComments: [
        'Very good progress in reading and health habits. A very active and cooperative learner.',
        'Demonstrates great interest in drawing and numbers. Makes steady, commendable academic strides.',
        'Shows great social development. She/He is polite, expressive, and writes beautifully.'
      ], 
      headComments: [
        'A very solid and promising academic performance. Well done!',
        'Highly commendable growth this term. Keep aiming for the very best.',
        'Displays a great learning attitude. Keep working hard and shining!'
      ] 
    },
    { 
      min: 40, 
      max: 59, 
      grade: 'B+', 
      remark: 'AWARD B+', 
      classComments: [
        'Shows good effort in writing and English, though requires regular guidance.',
        'Able to complete tasks independently in numbers and health habits. Progress is steady.',
        'A friendly learner who interacts well with others. More reading practice is encouraged.'
      ], 
      headComments: [
        'A good performance overall. With more focus next term, even better grades are within reach.',
        'Good learning progress. Regular practice during holidays will yield great improvement.',
        'Steady work. Keep pushing yourself to achieve greater competence.'
      ] 
    },
    { 
      min: 20, 
      max: 39, 
      grade: 'GOOD', 
      remark: 'AWARD GOOD', 
      classComments: [
        'A quiet learner who is slowly picking up basic reading and social concepts.',
        'Needs closer supervision in writing and numbers. Good effort shown so far.',
        'With more attentive listening and regular exercises, performance will certainly improve.'
      ], 
      headComments: [
        'A fair result. Please support him/her with extra writing and reading drills at home.',
        'Shows potential to do much better. Consistent attendance and support are key.',
        'A reasonable performance. Encourage more active participation in classroom activities.'
      ] 
    },
    { 
      min: 0, 
      max: 19, 
      grade: 'C+', 
      remark: 'AWARD C+', 
      classComments: [
        'Struggles with basic numbers and letter tracing. Needs intensive, hands-on learning support.',
        'Requires close guidance in English and social development. Regular coaching is highly advised.',
        'Finds reading and drawing tasks challenging. Let\'s work together to boost his/her confidence.'
      ], 
      headComments: [
        'Performance is below expectation. Remedial exercises and close parent-teacher guidance are urgent.',
        'A concerning result. Please schedule an urgent counseling and academic review meeting.',
        'With focused assistance and daily remedial sessions, significant progress can be made.'
      ] 
    }
  ];
}

export function defaultSectionSubjects(key: 'preprimary' | 'lower' | 'upper') {
  const map = {
    preprimary: ['NUMBERS', 'ENGLISH', 'HEALTH HABBITS', 'SOCIAL DEVELOPMENTS', 'READING', 'WRITING', 'DRAWING'],
    lower: ['English', 'Mathematics', 'Literacy 1', 'Literacy 2', 'Religious Education', 'Luganda'],
    upper: ['English', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'ICT / Integrated Studies']
  };
  return map[key].map(n => ({ name: n, max: 100 }));
}

export function defaultExamSets() {
  const sets = [];
  let id = 1;
  TERMS.forEach(term => {
    PERIODS.forEach(p => {
      sets.push({
        id: 'ES' + id,
        label: 'Set 1 ' + p.code,
        term,
        period: p.code,
        setNo: 1,
        classes: [...ALL_CLASSES]
      });
      id++;
    });
  });
  return sets;
}

export function defaultSystemUsers(): SystemUserAccount[] {
  return [
    {
      id: 'usr-admin',
      username: 'admin',
      name: 'Ssemakula Joseph (Super Admin)',
      role: 'superuser',
      pinOrPassword: 'admin123',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-accountant',
      username: 'accountant',
      name: 'Finance Bursar (Accountant)',
      role: 'accountant',
      pinOrPassword: '1234',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-security',
      username: 'security',
      name: 'Sgt. Okello Ronald (Security)',
      role: 'security',
      pinOrPassword: '1234',
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr-teacher',
      username: 'teacher',
      name: 'Tr. Samuel Ddungu (Teacher)',
      role: 'teacher',
      pinOrPassword: '1234',
      active: true,
      createdAt: new Date().toISOString()
    }
  ];
}

export function defaultSettings(): SchoolSettings {
  return {
    schoolName: 'OFF TU EDUCATION CENTRE',
    shortName: 'OTEC',
    motto: 'With God We Can – Skills Today, Success Tomorrow!',
    address: 'P.O. Box 203, Mukono, Uganda',
    tel1: '+256 701 234567',
    tel2: '+256 752 987654',
    logo: '',
    term: 'Term 3',
    year: 2026,
    headTeacherName: 'Ssemakula Joseph',
    headTeacherInitials: 'S.J.',
    psychomotor: ['Handwriting', 'Verbal Fluency', 'Games', 'Sports', 'Handling Tools', 'Drawing & Painting', 'Musical Skills'],
    sections: {
      preprimary: { subjects: defaultSectionSubjects('preprimary'), grading: defaultPrePrimaryGradingBands() },
      lower: { subjects: defaultSectionSubjects('lower'), grading: defaultGradingBands() },
      upper: { subjects: defaultSectionSubjects('upper'), grading: defaultGradingBands() }
    },
    examSets: defaultExamSets(),
    classTeachers: {
      'P7': { name: 'Onyango Geofrey', initials: 'O.G.' },
      'P6': { name: 'Okello Joseph', initials: 'O.J.' },
      'P5': { name: 'Abago Santa', initials: 'A.S.' },
      'P4': { name: 'Tr Justine Babirye', initials: 'J.B.' },
      'P3': { name: 'Nanozi Winnie', initials: 'N.W.' },
      'P2': { name: 'Nambirige Norah', initials: 'N.N.' },
      'P1': { name: 'Joy Kimera', initials: 'J.K.' },
      'ZEBRA': { name: 'Katulinde Lillian', initials: 'K.L.' },
      'LION': { name: 'Nakimera Justine', initials: 'N.J.' },
      'ELEPHANT': { name: 'Namazzi Brenda', initials: 'N.B.' }
    },
    pleOverride: {
      enabled: true,
      englishMinGradeForDiv1: 6, // C6 or better
      mathMinGradeForDiv1: 6,    // C6 or better
      englishMinGradeForDiv2: 8, // P8 or better
      mathMinGradeForDiv2: 8,    // P8 or better
      requireAllCoreSubjects: true
    },
    teachersList: [
      { id: 'T1', name: 'Okello Joseph', initials: 'O.J.', phone: '+256 700 000001', email: 'okello@school.ug', specialization: 'English' },
      { id: 'T2', name: 'Tr Justine Babirye', initials: 'J.B.', phone: '+256 700 000002', email: 'justine@school.ug', specialization: 'English' },
      { id: 'T3', name: 'Onyango Geofrey', initials: 'O.G.', phone: '+256 700 000003', email: 'onyango@school.ug', specialization: 'Mathematics' },
      { id: 'T4', name: 'Abago Santa', initials: 'A.S.', phone: '+256 700 000004', email: 'abago@school.ug', specialization: 'Social Studies' },
      { id: 'T5', name: 'Mweru Gonzaga', initials: 'M.G.', phone: '+256 700 000005', email: 'mweru@school.ug', specialization: 'Science' },
      { id: 'T6', name: 'Joy Kimera', initials: 'J.K.', phone: '+256 700 000006', email: 'joy@school.ug', specialization: 'Lower Primary' },
      { id: 'T7', name: 'Nimrod Nsanya', initials: 'N.N.', phone: '+256 700 000007', email: 'nimrod@school.ug', specialization: 'Class Helper' },
      { id: 'T8', name: 'Nambirige Norah', initials: 'N.No.', phone: '+256 700 000008', email: 'nambirige@school.ug', specialization: 'Literacy 1' },
      { id: 'T9', name: 'Nanozi Winnie', initials: 'N.W.', phone: '+256 700 000009', email: 'nanozi@school.ug', specialization: 'Luganda' },
      { id: 'T10', name: 'Namazzi Brenda', initials: 'N.B.', phone: '+256 700 000010', email: 'namazzi@school.ug', specialization: 'Nursery' },
      { id: 'T11', name: 'Katulinde Lillian', initials: 'K.L.', phone: '+256 700 000011', email: 'katulinde@school.ug', specialization: 'Nursery' },
      { id: 'T12', name: 'Nakimera Justine', initials: 'N.J.', phone: '+256 700 000012', email: 'nakimera@school.ug', specialization: 'Nursery' },
      { id: 'T13', name: 'Nabatanzi Annet', initials: 'N.A.', phone: '+256 700 000013', email: 'nabatanzi@school.ug', specialization: 'Nursery' }
    ],
    reportCardVisibility: {
      showTeacherComments: true,
      showPsychomotor: true,
      showRankingTable: true,
      showDivision: true,
      showStudentPhoto: true,
      showGradingScale: true,
      showSchoolLogo: true
    },
    calendarEvents: [
      { id: 'E1', title: 'Term 3 Official Opening Day', date: '2026-09-07', type: 'event', description: 'Welcome back students for the final academic term of the year.' },
      { id: 'E2', title: 'Independence Day Holiday', date: '2026-10-09', type: 'holiday', description: 'National public holiday. School remains closed for one day.' },
      { id: 'E3', title: 'Mid-Term Examinations Block', date: '2026-10-19', type: 'deadline', description: 'Mid-Term papers administered across all classes. Marks entry due by end of week.' },
      { id: 'E4', title: 'P7 UNEB PLE Mock Finals', date: '2026-11-09', type: 'deadline', description: 'Final mock series for Primary 7 candidates to prepare for UNEB PLE.' },
      { id: 'E5', title: 'Eid al-Adha Holiday', date: '2026-11-20', type: 'holiday', description: 'Eid holiday observed (subject to sighting of moon). School closed.' },
      { id: 'E6', title: 'End of Term Assessment Exams', date: '2026-11-30', type: 'deadline', description: 'Final End of Term promotional examinations.' },
      { id: 'E7', title: 'Christmas Thanksgiving Festival', date: '2026-12-04', type: 'event', description: 'Academic thanksgiving assembly, choir carols, and community feast.' },
      { id: 'E8', title: 'Report Cards & Graduation Day', date: '2026-12-11', type: 'event', description: 'Primary 7 promotional lists posted and Nurseries Graduation ceremony.' }
    ],
    // Default school fee structures
    feeTuitionLower: 310000,
    feeTuitionNursery: 290000,
    feeTuitionUpper: 335000,
    feeBoarding: 630000,
    feeVanMin: 100000,
    feeVanMax: 400000,
    feeRegistration: 20000,
    feeSweater: 50000,
    feeClassUniform: 50000,
    feeSportsWear: 70000,
    feeHair: 5000,
    feeHoliday: 5000,
    feeOthers: 0,
    // Auth & System Users Access Config
    authConfig: {
      requireLoginOnStartup: true,
      users: defaultSystemUsers()
    }
  };
}

export function getGradeRank(grade: string): number {
  const map: { [key: string]: number } = {
    'D1': 1, 'D2': 2, 'C3': 3, 'C4': 4, 'C5': 5, 'C6': 6, 'P7': 7, 'P8': 8, 'F9': 9
  };
  return map[grade] || 9;
}

export const UNEB_GRADING_BANDS: GradingBand[] = [
  { min: 90, max: 100, grade: 'D1', remark: 'Distinction 1', classComments: ['Shows excellent understanding and active participation.', 'An outstanding performance this term. Keep it up.'], headComments: ['A truly outstanding result. Well done.', 'Excellent performance; a role model to peers.'] },
  { min: 80, max: 89, grade: 'D2', remark: 'Distinction 2', classComments: ['Very good performance with consistent effort.', 'A brilliant result; keep up the high standard.'], headComments: ['A very good result overall. Keep working hard.', 'Demonstrates great potential and commitment.'] },
  { min: 70, max: 79, grade: 'C3', remark: 'Credit 3', classComments: ['Good progress; should practice more to improve further.', 'A commendable effort. Well done.'], headComments: ['A good result. Aim even higher next term.', 'Satisfactory performance; keep aspiring for greatness.'] },
  { min: 60, max: 69, grade: 'C4', remark: 'Credit 4', classComments: ['Fairly good work; more consistency is needed.', 'Shows interest in lessons. Good try.'], headComments: ['Fairly good performance; more effort is encouraged.', 'Steady progress made. Work for better results next term.'] },
  { min: 55, max: 59, grade: 'C5', remark: 'Credit 5', classComments: ['Average performance; needs more practice at home.', 'A solid effort. There is room for improvement.'], headComments: ['An average result; more effort is required.', 'Encourage steady reading and practice at home.'] },
  { min: 50, max: 54, grade: 'C6', remark: 'Credit 6', classComments: ['A pass grade; needs to improve consistency in written work.', 'Capable of better results with focus.'], headComments: ['A pass; please encourage more reading and practice at home.', 'With more concentration, a higher grade can be achieved.'] },
  { min: 45, max: 49, grade: 'P7', remark: 'Pass 7', classComments: ['A weak pass; extra practice is strongly recommended.', 'Finds some concepts challenging. Needs revision.'], headComments: ['Needs to put in a lot more effort next term.', 'Extra coaching and supportive practice are advised.'] },
  { min: 40, max: 44, grade: 'P8', remark: 'Pass 8', classComments: ['Poor performance; needs close guidance and support.', 'Struggling with standard classroom work.'], headComments: ['Performance is below expectation; needs close support at home.', 'Remedial assistance is strongly recommended.'] },
  { min: 0, max: 39, grade: 'F9', remark: 'Fail 9', classComments: ['Needs to improve consistency in written work.', 'Requires urgent extra support and remedial practice.'], headComments: ['A concerning result; parents and guardians should engage the school urgently.', 'Remedial support is highly critical at this stage.'] }
];

export function getDemoData(): AppData {
  const learners: Learner[] = regenerateUNEBNumbers(getSeededLearners());

  const scores: { [key: string]: ScoreRecord } = {};
  const psychomotor: { [key: string]: PsychomotorRecord } = {};
  const comments: { [key: string]: CommentRecord } = {};

  // Let's seed ES9 which is Term 3 EOT
  const esId = 'ES9'; // Term 3 - EOT (Set 1)

  // Seed standard grades for a few learners so there is high-fidelity demo data
  // Prossy Patrah Nagita (seeded_5, P7 candidate) - excellent, Div 1
  scores[`seeded_5|${esId}`] = {
    'English': 88,
    'Mathematics': 92,
    'Science': 85,
    'Social Studies': 80,
    'Religious Education': 78,
    'ICT / Integrated Studies': 82
  };
  psychomotor[`seeded_5|${esId}`] = {
    'Handwriting': 5, 'Verbal Fluency': 4, 'Games': 5, 'Sports': 4, 'Handling Tools': 4, 'Drawing & Painting': 5, 'Musical Skills': 3
  };
  comments[`seeded_5|${esId}`] = {
    teacher: 'An outstanding performance! Prossy is very disciplined and participates actively in class.',
    head: 'Excellent progress. A potential Division 1 in the upcoming PLE.',
    teacherInitials: 'S.D.',
    headInitials: 'N.J.',
    nextTermBegins: '2027-02-05'
  };

  // Gerald Bumba (seeded_6, P7 candidate) - good, Div 2
  scores[`seeded_6|${esId}`] = {
    'English': 72,
    'Mathematics': 70,
    'Science': 75,
    'Social Studies': 68,
    'Religious Education': 72,
    'ICT / Integrated Studies': 70
  };
  psychomotor[`seeded_6|${esId}`] = {
    'Handwriting': 4, 'Verbal Fluency': 4, 'Games': 4, 'Sports': 4, 'Handling Tools': 4, 'Drawing & Painting': 4, 'Musical Skills': 4
  };
  comments[`seeded_6|${esId}`] = {
    teacher: 'Gerald is very consistent. A strong Division 2 performance this term.',
    head: 'Good work. Aim for Division 1 in the next mock series.',
    teacherInitials: 'S.D.',
    headInitials: 'N.J.',
    nextTermBegins: '2027-02-05'
  };

  // Ashim Mabonga (seeded_7, P7 candidate) - struggles with math
  scores[`seeded_7|${esId}`] = {
    'English': 65,
    'Mathematics': 42, // F9
    'Science': 68,
    'Social Studies': 70,
    'Religious Education': 60,
    'ICT / Integrated Studies': 58
  };
  psychomotor[`seeded_7|${esId}`] = {
    'Handwriting': 3, 'Verbal Fluency': 4, 'Games': 5, 'Sports': 4, 'Handling Tools': 3, 'Drawing & Painting': 3, 'Musical Skills': 3
  };
  comments[`seeded_7|${esId}`] = {
    teacher: 'Ashim has made progress but requires intensive assistance in Mathematics.',
    head: 'A concerning grade in Math. Please schedule a guidance session with his teachers.',
    teacherInitials: 'S.D.',
    headInitials: 'N.J.',
    nextTermBegins: '2027-02-05'
  };

  // Fahim Kyeyune (seeded_8, P7 candidate) - average
  scores[`seeded_8|${esId}`] = {
    'English': 60,
    'Mathematics': 62,
    'Science': 65,
    'Social Studies': 64,
    'Religious Education': 58,
    'ICT / Integrated Studies': 60
  };
  psychomotor[`seeded_8|${esId}`] = {
    'Handwriting': 4, 'Verbal Fluency': 4, 'Games': 4, 'Sports': 4, 'Handling Tools': 4, 'Drawing & Painting': 4, 'Musical Skills': 4
  };
  comments[`seeded_8|${esId}`] = {
    teacher: 'Fahim is dedicated and tries his best. Continuous reading is recommended.',
    head: 'A satisfactory report card. Work harder to unleash your potential.',
    teacherInitials: 'S.D.',
    headInitials: 'N.J.',
    nextTermBegins: '2027-02-05'
  };

  // Victor Mugisha (seeded_2, P1 student) - very strong
  scores[`seeded_2|${esId}`] = {
    'English': 90,
    'Mathematics': 88,
    'Literacy 1': 82,
    'Literacy 2': 85,
    'Religious Education': 80,
    'Luganda': 84
  };
  psychomotor[`seeded_2|${esId}`] = {
    'Handwriting': 4, 'Verbal Fluency': 5, 'Games': 4, 'Sports': 3, 'Handling Tools': 4, 'Drawing & Painting': 4, 'Musical Skills': 4
  };
  comments[`seeded_2|${esId}`] = {
    teacher: 'Victor is a brilliant and well-behaved young learner. Keep it up!',
    head: 'Superb learning foundation. A well-deserved grade.',
    teacherInitials: 'N.P.',
    headInitials: 'N.J.',
    nextTermBegins: '2027-02-05'
  };

  const finances: FinanceTransaction[] = [
    {
      id: 'tx-1',
      date: '2026-07-01',
      type: 'income',
      category: 'Tuition Fees',
      amount: 450000,
      studentId: 'seeded_5',
      description: 'Term 3 Tuition Fee Payment - Prossy Patrah Nagita',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'tx-2',
      date: '2026-07-02',
      type: 'income',
      category: 'Boarding Fees',
      amount: 250000,
      studentId: 'seeded_2',
      description: 'Term 3 Boarding Amenity Fee - Victor Mugisha',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Mobile Money'
    },
    {
      id: 'tx-3',
      date: '2026-07-04',
      type: 'expense',
      category: 'Stationery',
      amount: 180000,
      description: 'Purchase of UNEB PLE primary revision booklets & mock papers',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Cash'
    },
    {
      id: 'tx-4',
      date: '2026-07-05',
      type: 'expense',
      category: 'Food & Meals',
      amount: 450000,
      description: 'Bulk order of maize flour, beans, and cooking oil for student lunches',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Cash'
    },
    {
      id: 'tx-5',
      date: '2026-07-08',
      type: 'expense',
      category: 'Teacher Salaries',
      amount: 1500000,
      description: 'Part-payment advance for Primary 7 candidate class teachers',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Bank Transfer'
    },
    {
      id: 'tx-6',
      date: '2026-07-09',
      type: 'income',
      category: 'Uniforms',
      amount: 75000,
      studentId: 'seeded_5',
      description: 'New official school uniform set and sports kit',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Cash'
    },
    {
      id: 'tx-7',
      date: '2026-07-10',
      type: 'expense',
      category: 'Utilities',
      amount: 125000,
      description: 'National Water and Sewerage Corporation (NWSC) utility bill',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Mobile Money'
    },
    {
      id: 'tx-8',
      date: '2026-07-11',
      type: 'income',
      category: 'Tuition Fees',
      amount: 380000,
      description: 'Term 3 partial tuition fees installment',
      recordedBy: 'Ssemakula Joseph',
      paymentMethod: 'Mobile Money'
    }
  ];

  return {
    learners,
    scores,
    psychomotor,
    comments,
    settings: defaultSettings(),
    finances,
    security: getDemoSecurityData(),
    transport: {
    vans: [], fuelLogs: [], maintenanceLogs: [],
      routes: [{ id: 'route-1', name: 'Kampala Express', driver: 'Musa', capacity: 30, costPerTerm: 250000 }],
      allocations: [{ id: 'alloc-1', learnerId: learners[0]?.id || '', routeId: 'route-1', stopName: 'Ntinda', direction: 'Both', amountPaid: 250000, term: 'Term 3 2026' }]
    },
    library: {
      books: [{ id: 'bk-1', title: 'Primary Science Bk 7', author: 'MK Publishers', isbn: '978-X', category: 'Science', totalCopies: 20, availableCopies: 19 }],
      issues: [{ id: 'iss-1', bookId: 'bk-1', issuedToType: 'Learner', issuedToId: learners[0]?.id || '', issueDate: new Date().toISOString(), dueDate: new Date(Date.now() + 86400000 * 7).toISOString(), status: 'Issued' }]
    },
    inventory: {
      assets: [{ id: 'ast-1', name: 'Dell Latitude 3420', category: 'Electronics', condition: 'Good', status: 'Assigned', assignedTo: 'T1', purchaseDate: '2025-01-10', value: 2500000, notes: 'Teacher Laptop' }]
    },
    hostel: {
      dormitories: [{ id: 'dorm-1', name: 'Mandela House', gender: 'Boys', capacity: 50, patronId: 'T1', rooms: [{ id: 'rm-1', name: 'Room 1', capacity: 10 }] }],
      allocations: [{ id: 'ha-1', learnerId: learners[0]?.id || '', dormitoryId: 'dorm-1', roomId: 'rm-1', bedNumber: '1', term: 'Term 3' }]
    },
    timetable: {
      slots: generateDemoTimetable()
    },
    clinic: {
      records: { [learners[0]?.id || '']: { learnerId: learners[0]?.id || '', allergies: 'Peanuts', chronicConditions: 'Asthma', emergencyContact: '0772000000' } },
      visits: [{ id: 'cv-1', learnerId: learners[0]?.id || '', date: new Date().toISOString(), symptoms: 'Headache', diagnosis: 'Migraine', treatment: 'Paracetamol', nurseName: 'Nurse Jane' }]
    },
    discipline: {
      incidents: [{ id: 'inc-1', learnerId: learners[0]?.id || '', date: new Date().toISOString(), type: 'Merit', points: 5, description: 'Outstanding performance in debate', actionTaken: 'Praise', reportedBy: 'T2' }]
    },
    extracurricular: {
      clubs: [{ id: 'cl-1', name: 'Debate Club', description: 'School debating society', patronId: 'T2', meetingDay: 'Friday', meetingTime: '16:00' }],
      memberships: [{ id: 'mem-1', clubId: 'cl-1', learnerId: learners[0]?.id || '', role: 'President', joinedDate: new Date().toISOString() }]
    },
    admissions: {
      applicants: []
    },
    procurement: {
      requests: []
    },
    communications: {
      messages: [
        {
          id: 'msg-1',
          type: 'SMS',
          recipientId: 'ALL_PARENTS',
          recipientName: 'All Parents',
          recipientContact: 'Multiple',
          body: 'Dear Parents, Term 3 officially begins on 7th Sept 2026. Please ensure all outstanding fee balances are cleared. OTEC Mgt.',
          sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: 'Delivered',
          sentBy: 'Ssemakula Joseph'
        },
        {
          id: 'msg-2',
          type: 'SMS',
          recipientId: 'seeded_5', // Prossy
          recipientName: 'Nagita Prossy Parent',
          recipientContact: '+256701000000',
          body: 'Dear Parent, Nagita Prossy has an outstanding balance of UGX 150,000. Please clear before Mid-Term exams.',
          sentAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          status: 'Delivered',
          sentBy: 'Ssemakula Joseph'
        }
      ]
    },
    auditLogs: [],
    vendors: [],
    vendorInvoices: [],
    requisitions: []
  };
}

export function generateDemoTimetable() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots: any[] = [];
  let idCounter = 1;

  const createSlot = (cls: string, day: string, start: string, end: string, subject: string, teacherId: string) => {
    slots.push({
      id: `ts-${idCounter++}`,
      classId: cls,
      dayOfWeek: day,
      startTime: start,
      endTime: end,
      subjectId: subject,
      teacherId,
      roomId: `Room ${cls}`
    });
  };

  // Nursery (ZEBRA, LION, ELEPHANT)
  // Teachers: T10 (Elephant), T11 (Zebra), T12 (Lion), T13 (Nabatanzi Annet - one subject)
  const nurseryClasses = [
    { id: 'ELEPHANT', teacher: 'T10' },
    { id: 'ZEBRA', teacher: 'T11' },
    { id: 'LION', teacher: 'T12' }
  ];
  const nurserySubjects = ['NUMBERS', 'ENGLISH', 'HEALTH HABBITS', 'SOCIAL DEVELOPMENTS', 'READING', 'WRITING', 'DRAWING'];
  
  for (const nc of nurseryClasses) {
    for (const day of days) {
      if (day === 'Saturday') continue; // Nursery doesn't do Saturday in this strict schedule usually, but if they do, we can just let it be. Let's do Monday-Friday.
      
      // Morning Circle
      createSlot(nc.id, day, '08:00', '08:30', 'Morning Circle', nc.teacher);
      
      // 3 Lessons per day (30 mins each)
      // Main teacher teaches 2, Nabatanzi (T13) teaches 1.
      createSlot(nc.id, day, '08:30', '09:00', nurserySubjects[0], nc.teacher);
      createSlot(nc.id, day, '09:00', '09:30', nurserySubjects[1], 'T13');
      
      // 09:30 - 10:30 Breakfast / Free time (Not a lesson slot)
      createSlot(nc.id, day, '10:30', '11:00', nurserySubjects[2], nc.teacher);
      
      // End of day is 12:30 (Lunch at 12:30, depart at 13:30)
    }
  }

  // Lower Primary (P1, P2, P3)
  // Joy (T6) P1, Nimrod (T7) Helper, Nambirige (T8) Literacy P1-P3, Nanozi (T9) Luganda P1-P3
  const lowerClasses = ['P1', 'P2', 'P3'];
  const lowerSubjects = ['English', 'Mathematics', 'Literacy 1', 'Literacy 2', 'Religious Education', 'Luganda'];
  const lowerTimeSlots = [
    { start: '06:30', end: '07:30' },
    { start: '07:30', end: '08:30' },
    { start: '08:30', end: '09:30' },
    { start: '09:30', end: '10:30' },
    // 10:30 - 11:00 Breakfast Break
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    // 13:00 - 14:00 Lunch Break
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }
  ];

  const getLowerTeacher = (cls: string, subject: string) => {
    if (subject === 'Literacy 1' || subject === 'Literacy 2') return 'T8'; // Nambirige Norah
    if (subject === 'Luganda') return 'T9'; // Nanozi Winnie
    if (cls === 'P1') return 'T6'; // Joy Kimera
    return `T${Math.floor(Math.random() * 2) + 6}`; // Random default fallback
  };

  for (const cls of lowerClasses) {
    for (const day of days) {
      if (day === 'Saturday') continue;
      lowerTimeSlots.forEach(ts => {
        const sub = lowerSubjects[Math.floor(Math.random() * lowerSubjects.length)];
        createSlot(cls, day, ts.start, ts.end, sub, getLowerTeacher(cls, sub));
      });
    }
  }

  // Upper Primary (P4, P5, P6, P7)
  // T1: Okello Joseph (English P5-P7)
  // T2: Justine Babirye (English P3-P4)
  // T3: Onyango Geofrey (Math P5-P7)
  // T4: Abago Santa (SST P5-P7)
  // T5: Mweru Gonzaga (Science P5-P7)
  const upperClasses = ['P4', 'P5', 'P6', 'P7'];
  const upperSubjects = ['English', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'ICT / Integrated Studies'];
  const upperTimeBlocks = [
    { start: '06:00', end: '07:20' }, // 80 mins
    { start: '07:20', end: '08:40' },
    { start: '08:40', end: '10:00' },
    // 10:00 - 10:30 (Free period/Break 1)
    { start: '10:30', end: '11:00' }, // Breakfast Break (Wait, this is an actual break, we shouldn't schedule lessons here)
    // Actually the user said Breakfast is 10:30 to 11:00.
    // Let's schedule lessons around it.
    // 10:00 - 10:30 -> Not breakfast, so maybe a 30 min single period?
    // Let's just adjust the slots to fit nicely:
    { start: '06:30', end: '07:50' }, // if we shift? User said 6:00 AM start.
    { start: '11:00', end: '12:20' }, // 80 mins
    { start: '12:20', end: '13:00' }, // 40 min single
    // 13:00 - 14:00 Lunch
    { start: '14:00', end: '15:20' }, // 80 mins
    { start: '15:20', end: '16:40' }, // 80 mins
    // 16:40 - 17:00 (End of day)
    // Extra lessons
    { start: '19:00', end: '20:20' }, // 80 mins
    { start: '20:20', end: '21:00' }  // 40 mins
  ];

  // Let's rewrite upperTimeBlocks so that they are strictly lesson periods (not breaks)
  const actualUpperBlocks = [
    { start: '06:00', end: '07:20' },
    { start: '07:20', end: '08:40' },
    { start: '08:40', end: '10:00' },
    { start: '10:00', end: '10:30' }, // 30 mins
    // 10:30 - 11:00 Breakfast
    { start: '11:00', end: '12:20' }, 
    { start: '12:20', end: '13:00' }, // 40 mins
    // 13:00 - 14:00 Lunch
    { start: '14:00', end: '15:20' },
    { start: '15:20', end: '16:40' },
    // Extra lessons
    { start: '19:00', end: '20:20' },
    { start: '20:20', end: '21:00' }
  ];

  const getUpperTeacher = (cls: string, subject: string) => {
    if (cls === 'P5' || cls === 'P6' || cls === 'P7') {
      if (subject === 'English') return 'T1';
      if (subject === 'Mathematics') return 'T3';
      if (subject === 'Social Studies') return 'T4';
      if (subject === 'Science') return 'T5';
    } else if (cls === 'P4') {
      if (subject === 'English') return 'T2';
    }
    // Fallback
    return `T${Math.floor(Math.random() * 5) + 1}`; 
  };

  for (const cls of upperClasses) {
    for (const day of days) {
      actualUpperBlocks.forEach(ts => {
        const sub = upperSubjects[Math.floor(Math.random() * upperSubjects.length)];
        createSlot(cls, day, ts.start, ts.end, sub, getUpperTeacher(cls, sub));
      });
    }
  }

  return slots;
}

export function getDemoSecurityData(): SecurityData {
  const now = new Date();
  
  return {
    gateLogs: [
      {
        id: 'glog-1',
        timestamp: new Date(now.getTime() - 3600000 * 3.5).toISOString(),
        personType: 'Teacher',
        personName: 'Tr. Samuel Ddungu',
        personId: 'TCH-001',
        classOrDepartment: 'Mathematics / Primary 7',
        verificationMethod: 'Face Recognition',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Present',
        notes: 'Clocked in on time. 9.5 hours daily duty started.',
        parentNotified: false,
        workHoursLogged: 9.5,
        temperatureCelsius: 36.5,
        livenessConfidence: 99.2
      },
      {
        id: 'glog-2',
        timestamp: new Date(now.getTime() - 3600000 * 3).toISOString(),
        personType: 'Student',
        personName: 'Prossy Patrah Nagita',
        personId: 'OTEC-P7-001',
        classOrDepartment: 'P7 Zebra',
        verificationMethod: 'Face Recognition',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Present',
        notes: 'Morning arrival. Attendance registered automatically.',
        parentNotified: true,
        temperatureCelsius: 36.4,
        livenessConfidence: 98.7
      },
      {
        id: 'glog-3',
        timestamp: new Date(now.getTime() - 3600000 * 2.5).toISOString(),
        personType: 'Student',
        personName: 'Melvin Ezra Nsubuga',
        personId: 'OTEC-P6-014',
        classOrDepartment: 'P6 Blue',
        verificationMethod: 'Fingerprint (ZKTeco)',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Present',
        notes: 'Fingerprint scan matched. Gate opened.',
        parentNotified: true,
        temperatureCelsius: 36.6,
        livenessConfidence: 97.9
      },
      {
        id: 'glog-4',
        timestamp: new Date(now.getTime() - 3600000 * 2.1).toISOString(),
        personType: 'Student',
        personName: 'Joy Katiti Cynthia',
        personId: 'OTEC-P4-022',
        classOrDepartment: 'P4 Lion',
        verificationMethod: 'Face Recognition',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Late',
        notes: 'Arrived after 08:00 AM assembly cutoff. Flagged as late entry.',
        parentNotified: true,
        temperatureCelsius: 36.7,
        livenessConfidence: 99.0
      },
      {
        id: 'glog-5',
        timestamp: new Date(now.getTime() - 3600000 * 1.8).toISOString(),
        personType: 'Visitor',
        personName: 'Eng. David Mukasa',
        personId: 'BADGE-V-101',
        classOrDepartment: 'Ministry of Education Inspectorate',
        verificationMethod: 'Manual Guard Approval',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Approved',
        notes: 'School Inspection & Academic Standards Audit. Hosted by Headteacher Nsubuga.',
        parentNotified: false
      },
      {
        id: 'glog-6',
        timestamp: new Date(now.getTime() - 3600000 * 5).toISOString(),
        personType: 'Visitor',
        personName: 'Joan Akello',
        personId: 'BADGE-V-102',
        classOrDepartment: 'Uganda Bookshop Suppliers',
        verificationMethod: 'Manual Guard Approval',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Overdue',
        notes: 'Delivery of Term 3 UNEB Past Papers. Expected exit was 11:30 AM.',
        parentNotified: false
      },
      {
        id: 'glog-7',
        timestamp: new Date(now.getTime() - 3600000 * 1.1).toISOString(),
        personType: 'Unknown',
        personName: 'Unidentified Person (Red Alert)',
        verificationMethod: 'Unrecognized',
        gateUsed: 'Main Gate - Gate A',
        direction: 'Entry',
        status: 'Alarm_Triggered',
        notes: 'Face & Fingerprint failed matching. Anti-spoofing alert raised.',
        parentNotified: false
      }
    ],
    visitors: [
      {
        id: 'vis-1',
        visitorName: 'Eng. David Mukasa',
        phone: '+256 772 123456',
        nationalId: 'CM88012345678A',
        company: 'Ministry of Education Inspectorate',
        purpose: 'Term 3 Curriculum Audit & UNEB Centre Inspection',
        hostTeacherName: 'Headteacher Nsubuga',
        vehicleNumber: 'UBA 123X',
        badgeNumber: 'OTEC-V-101',
        qrCode: 'OTEC-VIS-2026-101',
        arrivalTime: new Date(now.getTime() - 3600000 * 1.8).toISOString(),
        expectedDepartureTime: new Date(now.getTime() + 3600000 * 2).toISOString(),
        status: 'Inside School',
        approvedByGuard: 'Sgt. Okello Ronald (Gate A Guard)'
      },
      {
        id: 'vis-2',
        visitorName: 'Joan Akello',
        phone: '+256 701 987654',
        nationalId: 'CF92098765432B',
        company: 'Uganda Bookshop Ltd',
        purpose: 'Textbook & P7 Past Paper Stationary Delivery',
        hostTeacherName: 'Tr. Samuel Ddungu',
        vehicleNumber: 'UBG 456Y',
        badgeNumber: 'OTEC-V-102',
        qrCode: 'OTEC-VIS-2026-102',
        arrivalTime: new Date(now.getTime() - 3600000 * 5).toISOString(),
        expectedDepartureTime: new Date(now.getTime() - 3600000 * 2.5).toISOString(),
        status: 'Overdue',
        approvedByGuard: 'Sgt. Okello Ronald (Gate A Guard)'
      },
      {
        id: 'vis-3',
        visitorName: 'Robert Nsubuga',
        phone: '+256 782 555111',
        nationalId: 'CM79055511122C',
        company: 'Parent / Guardian',
        purpose: 'P6 School Fee Inquiry & Learner Progress Check',
        hostTeacherName: 'Bursar Ssemakula',
        vehicleNumber: 'UBM 789Z',
        badgeNumber: 'OTEC-V-100',
        qrCode: 'OTEC-VIS-2026-100',
        arrivalTime: new Date(now.getTime() - 3600000 * 6).toISOString(),
        expectedDepartureTime: new Date(now.getTime() - 3600000 * 4.5).toISOString(),
        actualDepartureTime: new Date(now.getTime() - 3600000 * 4.6).toISOString(),
        status: 'Exited',
        durationMinutes: 54,
        approvedByGuard: 'Sgt. Okello Ronald (Gate A Guard)'
      }
    ],
    unknownAlerts: [
      {
        id: 'unk-1',
        timestamp: new Date(now.getTime() - 3600000 * 1.1).toISOString(),
        gateUsed: 'Main Gate - Gate A',
        snapshotUrl: '',
        alarmActive: true,
        reason: 'Unrecognized Face & Fingerprint',
        status: 'Active Alarm',
        loggedBy: 'AI Hikvision Vision Sensor #01',
        notes: 'Unrecognized individual attempted gate entry. Security Guard dispatched.'
      }
    ],
    config: {
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
}

export function regenerateUNEBNumbers(learners: Learner[]): Learner[] {
  // Helper to extract sort keys for a student
  const getSortNames = (l: Learner) => {
    let local = '';
    let christian = '';
    if (l.lastName && l.firstName) {
      local = l.lastName.trim();
      christian = l.firstName.trim();
    } else {
      const parts = l.name.trim().split(/\s+/);
      if (parts.length === 1) {
        local = parts[0];
        christian = '';
      } else if (parts.length === 2) {
        const first = parts[0];
        const last = parts[1];
        if (first === first.toUpperCase() && last !== last.toUpperCase()) {
          local = first;
          christian = last;
        } else {
          local = last;
          christian = first;
        }
      } else {
        const first = parts[0];
        if (first === first.toUpperCase() && parts[1] !== parts[1].toUpperCase()) {
          local = first;
          christian = parts.slice(1).join(' ');
        } else {
          local = parts[parts.length - 1];
          christian = parts.slice(0, parts.length - 1).join(' ');
        }
      }
    }
    return {
      local: local.toLowerCase(),
      christian: christian.toLowerCase()
    };
  };

  // Separate P7 and non-P7 learners
  const p7Learners = learners.filter(l => l.cls === 'P7' || l.cls === 'Primary 7');
  const otherLearners = learners.filter(l => l.cls !== 'P7' && l.cls !== 'Primary 7');

  // Sort P7 learners alphabetically by local name first, christian name second
  p7Learners.sort((a, b) => {
    const keyA = getSortNames(a);
    const keyB = getSortNames(b);
    
    const localCompare = keyA.local.localeCompare(keyB.local);
    if (localCompare !== 0) {
      return localCompare;
    }
    return keyA.christian.localeCompare(keyB.christian);
  });

  // Assign UNEB index numbers sequentially starting from 300538/001 up to 300538/500
  const updatedP7 = p7Learners.map((learner, index) => {
    const indexNum = index + 1;
    const paddedIndex = indexNum.toString().padStart(3, '0'); // '001', '002', etc.
    const unebNo = `300538/${paddedIndex}`;
    return {
      ...learner,
      unebNo
    };
  });

  // Combine back into original array structure to preserve order
  return learners.map(l => {
    if (l.cls === 'P7' || l.cls === 'Primary 7') {
      const found = updatedP7.find(p => p.id === l.id);
      return found || l;
    } else {
      if (l.unebNo) {
        const { unebNo, ...rest } = l;
        return rest;
      }
      return l;
    }
  });
}
