import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { APIResponse, ApiSemester, CreateSemesterRequest, UpdateSemesterRequest } from '@/types';

export const semesterService = {
  // Get all semesters
  getAllSemesters: async (): Promise<APIResponse<ApiSemester[]>> => {
    const response = await api.get<APIResponse<ApiSemester[]>>(API_ENDPOINTS.SEMESTER.BASE);
    return response.data;
  },

  // Create new semester
  createSemester: async (semesterData: CreateSemesterRequest): Promise<APIResponse<ApiSemester>> => {
    const response = await api.post<APIResponse<ApiSemester>>(API_ENDPOINTS.SEMESTER.BASE, semesterData);
    return response.data;
  },

  // Get semester by ID
  getSemesterById: async (id: number | string): Promise<APIResponse<ApiSemester>> => {
    const response = await api.get<APIResponse<ApiSemester>>(API_ENDPOINTS.SEMESTER.BY_ID(id));
    return response.data;
  },

  // Update semester
  updateSemester: async (id: number | string, semesterData: UpdateSemesterRequest): Promise<APIResponse<ApiSemester>> => {
    const response = await api.put<APIResponse<ApiSemester>>(API_ENDPOINTS.SEMESTER.BY_ID(id), semesterData);
    return response.data;
  },

  // Delete semester
  deleteSemester: async (id: number | string): Promise<APIResponse<any>> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.SEMESTER.BY_ID(id));
    return response.data;
  },
};

export default semesterService;
