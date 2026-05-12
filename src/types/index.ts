export * from './auth/auth';
export * from './academic/campus';
export * from './academic/semester';
export * from './academic/menu';
export * from './academic/activity';
export * from './academic/timetable';
export * from './academic/evaluation';
export * from './billing/invoice';
export * from './billing/payment';
export * from './classes/class';
export * from './students/student';
export * from './students/parent-registration';
export * from './users/user';
export * from './users/role';
export * from './users/teacher';
export * from './common/common';

// UI Specific types (Legacy/Internal mappings used by pages)
export interface Staff {
  id: string;
  name: string;
  role: 'Admin' | 'Giáo viên' | 'Bảo mẫu' | 'Y tế' | 'Kế toán' | 'Bảo vệ' | 'Lao công';
  dob: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
}

export type UserRole = 'Admin' | 'Giáo viên' | 'Bảo mẫu' | 'Y tế' | 'Kế toán' | 'Bảo vệ' | 'Lao công';

export interface Class {
  id: string;
  name: string;
  code: string;
  year: number;
  room?: string;
  ageGroup?: string;
  maxCapacity?: number;
  teacher: string;
  teacherId?: string;
  mainTeacher?: string;
  supportTeachers?: string[];
  studentCount: number;
  students: Student[];
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  code: string;
  name: string;
  dob: string;
  gender: string;
  currentClass: string;
  parentName: string;
  address: string;
  status: 'active' | 'inactive';
  allergies?: string;
  photo?: string;
  bloodType?: string;
  medicalNotes?: string;
}
