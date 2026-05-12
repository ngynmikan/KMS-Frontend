import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ManagedUser, UserManagementStats, FlexibleResponse } from '@/types';

const userService = {
  // Get all users
  getAllUsers: async (): Promise<FlexibleResponse<ManagedUser[]>> => {
    const response = await api.get<FlexibleResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.USER_BASE);
    return response.data;
  },

  // Get all pending users
  getPendingUsers: async (): Promise<FlexibleResponse<ManagedUser[]>> => {
    const response = await api.get<FlexibleResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.PENDING);
    return response.data;
  },

  // Get all active users
  getActiveUsers: async (): Promise<FlexibleResponse<ManagedUser[]>> => {
    const response = await api.get<FlexibleResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.ACTIVE);
    return response.data;
  },

  // Get all inactive users
  getInactiveUsers: async (): Promise<FlexibleResponse<ManagedUser[]>> => {
    const response = await api.get<FlexibleResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.INACTIVE);
    return response.data;
  },

  // Get user status statistics
  getStatistics: async (): Promise<FlexibleResponse<UserManagementStats>> => {
    const response = await api.get<FlexibleResponse<UserManagementStats>>(API_ENDPOINTS.USER_MANAGEMENT.STATISTICS);
    return response.data;
  },

  // Approve pending user
  approveUser: async (userId: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.post<FlexibleResponse<any>>(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/approve`);
    return response.data;
  },

  // Reject pending user
  rejectUser: async (userId: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.post<FlexibleResponse<any>>(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/reject`);
    return response.data;
  },

  // Deactivate active user
  deactivateUser: async (userId: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.post<FlexibleResponse<any>>(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/deactivate`);
    return response.data;
  },

  // Activate inactive user
  activateUser: async (userId: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.post<FlexibleResponse<any>>(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/activate`);
    return response.data;
  },

  // Update user information
  updateUser: async (userId: number | string, data: any): Promise<FlexibleResponse<any>> => {
    const response = await api.put<FlexibleResponse<any>>(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}`, data);
    return response.data;
  },
};

export default userService;
