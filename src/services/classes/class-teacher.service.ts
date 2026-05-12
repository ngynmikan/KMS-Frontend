import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ClassTeacher, APIResponse } from '@/types';

export const classTeacherService = {
  // List class teacher by classID
  getTeachersByClass: async (classId: number | string): Promise<ClassTeacher[]> => {
    const response = await api.get<APIResponse<ClassTeacher[]>>(API_ENDPOINTS.CLASS_TEACHER.BY_CLASS(classId));
    return response.data.data ?? [];
  },

  // List class history by teacherID
  getClassesByTeacher: async (teacherId: number | string): Promise<ClassTeacher[]> => {
    const response = await api.get<APIResponse<ClassTeacher[]>>(API_ENDPOINTS.CLASS_TEACHER.BY_TEACHER(teacherId));
    return response.data.data ?? [];
  },

  // Assign teacher to class with specific role
  assignTeacherToClass: async (classId: number | string, teacherId: number, role: 'Main' | 'Support'): Promise<ClassTeacher> => {
    const response = await api.post<APIResponse<ClassTeacher>>(API_ENDPOINTS.CLASS_TEACHER.ASSIGN(classId), { teacherId, role });
    return response.data.data!;
  },

  // Update teacher role in class (Main/Support)
  updateTeacherRole: async (classId: number | string, teacherId: number | string, role: 'Main' | 'Support'): Promise<ClassTeacher> => {
    const response = await api.patch<APIResponse<ClassTeacher>>(API_ENDPOINTS.CLASS_TEACHER.UPDATE_ROLE(classId, teacherId), { role });
    return response.data.data!;
  },

  // Delete teacher from class
  removeTeacherFromClass: async (classId: number | string, teacherId: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.CLASS_TEACHER.REMOVE(classId, teacherId));
    return response.data.success;
  }
};

export default classTeacherService;
