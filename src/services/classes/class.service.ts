import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiClass, APIResponse } from '@/types';

export const classService = {
  // Get all classes
  getAllClasses: async (): Promise<APIResponse<ApiClass[]>> => {
    const response = await api.get<APIResponse<ApiClass[]>>(API_ENDPOINTS.CLASSES.BASE);
    return response.data;
  },

  // Create new class
  createClass: async (classData: Partial<ApiClass>): Promise<APIResponse<ApiClass>> => {
    const response = await api.post<APIResponse<ApiClass>>(API_ENDPOINTS.CLASSES.BASE, classData);
    return response.data;
  },

  // Get class by ID
  getClassById: async (id: number | string): Promise<APIResponse<ApiClass>> => {
    const response = await api.get<APIResponse<ApiClass>>(`${API_ENDPOINTS.CLASSES.BASE}/${id}`);
    return response.data;
  },

  // Update class
  updateClass: async (id: number | string, classData: Partial<ApiClass>): Promise<APIResponse<ApiClass>> => {
    const response = await api.put<APIResponse<ApiClass>>(`${API_ENDPOINTS.CLASSES.BASE}/${id}`, classData);
    return response.data;
  },

  // Delete class
  deleteClass: async (id: number | string): Promise<APIResponse<any>> => {
    const response = await api.delete<APIResponse<any>>(`${API_ENDPOINTS.CLASSES.BASE}/${id}`);
    return response.data;
  }
};

export default classService;
