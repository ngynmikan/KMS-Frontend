export type RegistrationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ApiParentRegistration {
  registrationId: number;
  parentName: string;
  phoneNumber: string;
  email: string;
  childName: string;
  childDateOfBirth: string;
  childGender: string;
  intendedStartDate: string;
  notes?: string;
  status: RegistrationStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SubmitRegistrationRequest {
  parentName: string;
  phoneNumber: string;
  email: string;
  childName: string;
  childDateOfBirth: string;
  childGender: string;
  intendedStartDate: string;
  notes?: string;
}

export interface ApproveRegistrationRequest {
  notes?: string;
  classId?: number;
}

export interface RejectRegistrationRequest {
  reason: string;
}
