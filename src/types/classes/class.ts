import { ApiStudent } from '../students/student';

export interface ApiClass {
  classId: number;
  className: string;
  room?: string;
  maxCapacity?: number;
  currentEnrollment: number;
  ageGroup?: string;
  schoolYearId: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  teacherId?: number; // Might be in ClassTeacher relation instead
}

export interface ClassStudent {
  classId: number;
  studentId: number;
  enrollmentDate: string;
  status: string;
  class?: ApiClass;
  student?: ApiStudent;
}

export interface CreateClassRequest {
  className: string;
  room?: string;
  maxCapacity?: number;
  ageGroup?: string;
  schoolYearId: number;
  teacherId?: number;
}

export interface EnrollMultipleRequest {
  studentIds: number[];
}

export interface TransferRequest {
  newClassId: number;
}

export interface ClassTeacher {
  classId: number;
  teacherId: number;
  role: 'Main' | 'Support';
  assignmentDate: string;
  class?: ApiClass;
  teacher?: any; // Will map to Staff/User type later
}

export interface AssignTeacherRequest {
  teacherId: number;
  role: 'Main' | 'Support';
}

