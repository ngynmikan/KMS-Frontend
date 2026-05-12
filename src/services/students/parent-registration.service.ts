import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  APIResponse, 
  ApiParentRegistration, 
  SubmitRegistrationRequest,
  ApproveRegistrationRequest,
  RejectRegistrationRequest
} from '@/types';

export const parentRegistrationService = {
  // Parent submit registration request
  submitRegistration: async (data: SubmitRegistrationRequest): Promise<APIResponse<ApiParentRegistration>> => {
    const response = await api.post<APIResponse<ApiParentRegistration>>(API_ENDPOINTS.PARENT_REGISTRATION.SUBMIT, data);
    return response.data;
  },

  // Get all registration requests (Admin)
  getAllRegistrations: async (): Promise<APIResponse<ApiParentRegistration[]>> => {
    const response = await api.get<APIResponse<ApiParentRegistration[]>>(API_ENDPOINTS.PARENT_REGISTRATION.BASE);
    return response.data;
  },

  // Get pending registration requests (Admin)
  getPendingRegistrations: async (): Promise<APIResponse<ApiParentRegistration[]>> => {
    const response = await api.get<APIResponse<ApiParentRegistration[]>>(API_ENDPOINTS.PARENT_REGISTRATION.PENDING);
    return response.data;
  },

  // Get registration request by ID (Admin)
  getRegistrationById: async (id: number | string): Promise<APIResponse<ApiParentRegistration>> => {
    const response = await api.get<APIResponse<ApiParentRegistration>>(API_ENDPOINTS.PARENT_REGISTRATION.BY_ID(id));
    return response.data;
  },

  // Approve registration request (Admin)
  approveRegistration: async (id: number | string, data: ApproveRegistrationRequest): Promise<APIResponse<any>> => {
    const response = await api.post<APIResponse<any>>(API_ENDPOINTS.PARENT_REGISTRATION.APPROVE(id), data);
    return response.data;
  },

  // Reject registration request (Admin)
  rejectRegistration: async (id: number | string, data: RejectRegistrationRequest): Promise<APIResponse<any>> => {
    const response = await api.post<APIResponse<any>>(API_ENDPOINTS.PARENT_REGISTRATION.REJECT(id), data);
    return response.data;
  },
};

export default parentRegistrationService;
