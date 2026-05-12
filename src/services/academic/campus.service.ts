import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { APIResponse, ApiCampus, CreateCampusRequest, UpdateCampusRequest } from '@/types';

export const campusService = {
  // Get all campuses
  getAllCampuses: async (): Promise<APIResponse<ApiCampus[]>> => {
    const response = await api.get<APIResponse<ApiCampus[]>>(API_ENDPOINTS.CAMPUSES.BASE);
    return response.data;
  },

  // Create new campus
  createCampus: async (campusData: CreateCampusRequest): Promise<APIResponse<ApiCampus>> => {
    const response = await api.post<APIResponse<ApiCampus>>(API_ENDPOINTS.CAMPUSES.BASE, campusData);
    return response.data;
  },

  // Get campus by ID
  getCampusById: async (id: number | string): Promise<APIResponse<ApiCampus>> => {
    const response = await api.get<APIResponse<ApiCampus>>(API_ENDPOINTS.CAMPUSES.BY_ID(id));
    return response.data;
  },

  // Update campus
  updateCampus: async (id: number | string, campusData: UpdateCampusRequest): Promise<APIResponse<ApiCampus>> => {
    const response = await api.put<APIResponse<ApiCampus>>(API_ENDPOINTS.CAMPUSES.BY_ID(id), campusData);
    return response.data;
  },

  // Delete campus
  deleteCampus: async (id: number | string): Promise<APIResponse<any>> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.CAMPUSES.BY_ID(id));
    return response.data;
  },
};

export default campusService;
