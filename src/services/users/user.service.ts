import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ManagedUser, UserManagementStats, APIResponse } from '@/types';

const userService = {
  // Get all users
  getAllUsers: async (): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.USER_BASE);
    return response.data.data ?? [];
  },

  // Get all pending users
  getPendingUsers: async (): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.PENDING);
    return response.data.data ?? [];
  },

  // Get all active users
  getActiveUsers: async (): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.ACTIVE);
    return response.data.data ?? [];
  },

  // Get all inactive users
  getInactiveUsers: async (): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(API_ENDPOINTS.USER_MANAGEMENT.INACTIVE);
    return response.data.data ?? [];
  },

  // Get user status statistics
  getStatistics: async (): Promise<UserManagementStats> => {
    const response = await api.get<APIResponse<UserManagementStats>>(API_ENDPOINTS.USER_MANAGEMENT.STATISTICS);
    return response.data.data!;
  },

  // Approve pending user
  approveUser: async (userId: number | string): Promise<any> => {
    const response = await api.post(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/approve`);
    return response.data;
  },

  // Reject pending user
  rejectUser: async (userId: number | string): Promise<any> => {
    const response = await api.post(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/reject`);
    return response.data;
  },

  // Deactivate active user
  deactivateUser: async (userId: number | string): Promise<any> => {
    const response = await api.post(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/deactivate`);
    return response.data;
  },

  // Activate inactive user
  activateUser: async (userId: number | string): Promise<any> => {
    const response = await api.post(`${API_ENDPOINTS.USER_MANAGEMENT.USER_BASE}/${userId}/activate`);
    return response.data;
  },
};

export default userService;
