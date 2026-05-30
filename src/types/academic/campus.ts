export interface ApiCampus {
  campusId: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCampusRequest {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
}

export interface UpdateCampusRequest extends Partial<CreateCampusRequest> {}
