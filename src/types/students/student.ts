export interface ApiStudent {
  studentId: number;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  address: string;
  photo?: string | null;
  bloodType?: string | null;
  allergies?: string | null;
  medicalNotes?: string | null;
  enrollmentDate: string;
  isActive: boolean;
  classId?: number | null;
  className?: string | null;
  parents: Parent[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Parent {
  parentId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  occupation: string;
  relationshipType?: string;
  isPrimaryContact?: boolean;
}

export interface StudentParent {
  studentId: number;
  parentId: number;
  relationshipType: string;
  isPrimaryContact: boolean;
  student?: ApiStudent;
  parent?: Parent;
}

export interface CreateStudentRequest {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  notes?: string;
  bloodType?: string;
  allergies?: string;
  medicalNotes?: string;
  enrollmentDate?: string;
  classId?: number;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  isActive?: boolean;
}
