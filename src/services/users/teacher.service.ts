import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  APIResponse, 
  ApiTeacher, 
  CreateTeacherRequest, 
  UpdateTeacherRequest 
} from '@/types';

export const teacherService = {
  // Get all teachers
  getAllTeachers: async (): Promise<APIResponse<ApiTeacher[]>> => {
    const response = await api.get<APIResponse<ApiTeacher[]>>(API_ENDPOINTS.TEACHER.BASE);
    return response.data;
  },

  // Create new teacher
  createTeacher: async (teacherData: CreateTeacherRequest): Promise<APIResponse<ApiTeacher>> => {
    const response = await api.post<APIResponse<ApiTeacher>>(API_ENDPOINTS.TEACHER.BASE, teacherData);
    return response.data;
  },

  // Get teacher by ID
  getTeacherById: async (id: number | string): Promise<APIResponse<ApiTeacher>> => {
    const response = await api.get<APIResponse<ApiTeacher>>(API_ENDPOINTS.TEACHER.BY_ID(id));
    return response.data;
  },

  // Update teacher
  updateTeacher: async (id: number | string, teacherData: UpdateTeacherRequest): Promise<APIResponse<ApiTeacher>> => {
    const response = await api.put<APIResponse<ApiTeacher>>(API_ENDPOINTS.TEACHER.BY_ID(id), teacherData);
    return response.data;
  },

  // Delete teacher
  deleteTeacher: async (id: number | string): Promise<APIResponse<any>> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.TEACHER.BY_ID(id));
    return response.data;
  },

  // Search teachers by keyword
  searchTeachers: async (keyword: string): Promise<APIResponse<ApiTeacher[]>> => {
    const response = await api.get<APIResponse<ApiTeacher[]>>(API_ENDPOINTS.TEACHER.SEARCH, {
      params: { keyword }
    });
    return response.data;
  },

  // Get all active teachers
  getActiveTeachers: async (): Promise<APIResponse<ApiTeacher[]>> => {
    const response = await api.get<APIResponse<ApiTeacher[]>>(API_ENDPOINTS.TEACHER.ACTIVE);
    return response.data;
  },
};

export default teacherService;
