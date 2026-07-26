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
      pinOrPassword: '1234',
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
      'P7': { name: 'Mr. Ssemwogerere David', initials: 'S.D.' },
      'P6': { name: 'Miss Atwine Phiona', initials: 'A.P.' },
      'P1': { name: 'Mrs. Nakayiza Proscovia', initials: 'N.P.' },
      'ZEBRA': { name: 'Mrs. Babirye Harriet', initials: 'B.H.' },
      'LION': { name: 'Mr. Mugisha Charles', initials: 'M.C.' },
      'ELEPHANT': { name: 'Miss Nalubega Brenda', initials: 'N.B.' }
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
      { id: 'T1', name: 'Mr. Ssemwogerere David', initials: 'S.D.', phone: '+256 772 111111', email: 'david.s@school.ug', specialization: 'Mathematics & Science' },
      { id: 'T2', name: 'Miss Atwine Phiona', initials: 'A.P.', phone: '+256 701 222222', email: 'phiona.a@school.ug', specialization: 'English & Social Studies' },
      { id: 'T3', name: 'Mrs. Nakayiza Proscovia', initials: 'N.P.', phone: '+256 752 333333', email: 'proscovia.n@school.ug', specialization: 'Literacy & Religious Education' },
      { id: 'T4', name: 'Mrs. Babirye Harriet', initials: 'B.H.', phone: '+256 782 444444', email: 'harriet.b@school.ug', specialization: 'Pre-Primary Development' },
      { id: 'T5', name: 'Mr. Mugisha Charles', initials: 'M.C.', phone: '+256 703 555555', email: 'charles.m@school.ug', specialization: 'Physical Education & Games' },
      { id: 'T6', name: 'Miss Nalubega Brenda', initials: 'N.B.', phone: '+256 754 666666', email: 'brenda.n@school.ug', specialization: 'Creative Arts & Music' }
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
    security: getDemoSecurityData()
  };
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
