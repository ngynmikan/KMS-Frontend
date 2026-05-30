import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiStudent, APIResponse } from '@/types';

export const studentService = {
  // Get all students
  getAllStudents: async (): Promise<ApiStudent[]> => {
    const response = await api.get<APIResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.BASE);
    return response.data.data ?? [];
  },

  // Create new student
  createStudent: async (student: Partial<ApiStudent>): Promise<ApiStudent> => {
    const response = await api.post<APIResponse<ApiStudent>>(API_ENDPOINTS.STUDENT.BASE, student);
    return response.data.data!;
  },

  // Get student by ID
  getStudentById: async (id: number | string): Promise<ApiStudent> => {
    const response = await api.get<APIResponse<ApiStudent>>(`${API_ENDPOINTS.STUDENT.BASE}/${id}`);
    return response.data.data!;
  },

  // Update student
  updateStudent: async (id: number | string, student: Partial<ApiStudent>): Promise<ApiStudent> => {
    const response = await api.put<APIResponse<ApiStudent>>(`${API_ENDPOINTS.STUDENT.BASE}/${id}`, student);
    return response.data.data!;
  },

  // Delete student
  deleteStudent: async (id: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(`${API_ENDPOINTS.STUDENT.BASE}/${id}`);
    return response.data.success;
  },

  // Search students
  searchStudents: async (keyword: string): Promise<ApiStudent[]> => {
    const response = await api.get<APIResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.SEARCH, {
      params: { keyword }
    });
    return response.data.data ?? [];
  },

  // Get active students
  getActiveStudents: async (): Promise<ApiStudent[]> => {
    const response = await api.get<APIResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.ACTIVE);
    return response.data.data ?? [];
  },

  // Get students by parent ID
  getStudentsByParent: async (parentId: number | string): Promise<ApiStudent[]> => {
    const response = await api.get<APIResponse<ApiStudent[]>>(API_ENDPOINTS.STUDENT.BY_PARENT(parentId));
    return response.data.data ?? [];
  }
};

export default studentService;
