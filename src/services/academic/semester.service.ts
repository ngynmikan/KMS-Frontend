import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiSemester, CreateSemesterRequest, UpdateSemesterRequest, FlexibleResponse } from '@/types';

export const semesterService = {
  // Get all semesters
  getAllSemesters: async (): Promise<FlexibleResponse<ApiSemester[]>> => {
    const response = await api.get<FlexibleResponse<ApiSemester[]>>(API_ENDPOINTS.SEMESTER.BASE);
    return response.data;
  },

  // Create new semester
  createSemester: async (semesterData: CreateSemesterRequest): Promise<FlexibleResponse<ApiSemester>> => {
    const response = await api.post<FlexibleResponse<ApiSemester>>(API_ENDPOINTS.SEMESTER.BASE, semesterData);
    return response.data;
  },

  // Get semester by ID
  getSemesterById: async (id: number | string): Promise<FlexibleResponse<ApiSemester>> => {
    const response = await api.get<FlexibleResponse<ApiSemester>>(API_ENDPOINTS.SEMESTER.BY_ID(id));
    return response.data;
  },

  // Update semester
  updateSemester: async (id: number | string, semesterData: UpdateSemesterRequest): Promise<FlexibleResponse<ApiSemester>> => {
    const response = await api.put<FlexibleResponse<ApiSemester>>(API_ENDPOINTS.SEMESTER.BY_ID(id), semesterData);
    return response.data;
  },

  // Delete semester
  deleteSemester: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(API_ENDPOINTS.SEMESTER.BY_ID(id));
    return response.data;
  },
};

export default semesterService;
