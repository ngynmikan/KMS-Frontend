import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiStudent, FlexibleResponse } from '@/types';

export const studentService = {
  // Get all students
  getAllStudents: async (): Promise<FlexibleResponse<ApiStudent[]>> => {
    const response = await api.get<FlexibleResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.BASE);
    return response.data;
  },

  // Create new student
  createStudent: async (student: Partial<ApiStudent>): Promise<FlexibleResponse<ApiStudent>> => {
    const response = await api.post<FlexibleResponse<ApiStudent>>(API_ENDPOINTS.STUDENT.BASE, student);
    return response.data;
  },

  // Get student by ID
  getStudentById: async (id: number | string): Promise<FlexibleResponse<ApiStudent>> => {
    const response = await api.get<FlexibleResponse<ApiStudent>>(`${API_ENDPOINTS.STUDENT.BASE}/${id}`);
    return response.data;
  },

  // Update student
  updateStudent: async (id: number | string, student: Partial<ApiStudent>): Promise<FlexibleResponse<ApiStudent>> => {
    const response = await api.put<FlexibleResponse<ApiStudent>>(`${API_ENDPOINTS.STUDENT.BASE}/${id}`, student);
    return response.data;
  },

  // Delete student
  deleteStudent: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(`${API_ENDPOINTS.STUDENT.BASE}/${id}`);
    return response.data;
  },

  // Search students
  searchStudents: async (keyword: string): Promise<FlexibleResponse<ApiStudent[]>> => {
    const response = await api.get<FlexibleResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.SEARCH, {
      params: { keyword }
    });
    return response.data;
  },

  // Get active students
  getActiveStudents: async (): Promise<FlexibleResponse<ApiStudent[]>> => {
    const response = await api.get<FlexibleResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.ACTIVE);
    return response.data;
  },

  // Get students by parent ID
  getStudentsByParent: async (parentId: number | string): Promise<FlexibleResponse<ApiStudent[]>> => {
    const response = await api.get<FlexibleResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.BY_PARENT(parentId));
    return response.data;
  }
};

export default studentService;
