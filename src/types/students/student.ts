export interface ApiStudent {
  studentId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Parent {
  parentId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  occupation: string;
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
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  isActive?: boolean;
}
