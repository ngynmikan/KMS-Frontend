export interface ApiSemester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSemesterRequest {
  name: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  isActive: boolean;
}

export interface UpdateSemesterRequest extends Partial<CreateSemesterRequest> {}
