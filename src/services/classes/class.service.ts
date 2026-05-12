import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiClass, FlexibleResponse } from '@/types';

export const classService = {
  // Get all classes
  getAllClasses: async (): Promise<FlexibleResponse<ApiClass[]>> => {
    const response = await api.get<FlexibleResponse<ApiClass[]>>(API_ENDPOINTS.CLASSES.BASE);
    return response.data;
  },

  // Create new class
  createClass: async (classData: Partial<ApiClass>): Promise<FlexibleResponse<ApiClass>> => {
    const response = await api.post<FlexibleResponse<ApiClass>>(API_ENDPOINTS.CLASSES.BASE, classData);
    return response.data;
  },

  // Get class by ID
  getClassById: async (id: number | string): Promise<FlexibleResponse<ApiClass>> => {
    const response = await api.get<FlexibleResponse<ApiClass>>(`${API_ENDPOINTS.CLASSES.BASE}/${id}`);
    return response.data;
  },

  // Update class
  updateClass: async (id: number | string, classData: Partial<ApiClass>): Promise<FlexibleResponse<ApiClass>> => {
    const response = await api.put<FlexibleResponse<ApiClass>>(`${API_ENDPOINTS.CLASSES.BASE}/${id}`, classData);
    return response.data;
  },

  // Delete class
  deleteClass: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(`${API_ENDPOINTS.CLASSES.BASE}/${id}`);
    return response.data;
  }
};

export default classService;
