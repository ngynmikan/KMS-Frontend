export interface ApiTeacher {
  teacherId: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  qualification?: string;
  experienceYears?: number;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeacherRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  qualification?: string;
  experienceYears?: number;
  notes?: string;
}

export interface UpdateTeacherRequest extends Partial<CreateTeacherRequest> {
  isActive?: boolean;
}

export interface TeacherSearchRequest {
  keyword?: string;
}
