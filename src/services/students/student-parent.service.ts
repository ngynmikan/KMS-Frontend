import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { StudentParent, APIResponse } from '@/types';

export const studentParentService = {
  // Get parent by studentID
  getParentByStudentId: async (studentId: number | string): Promise<StudentParent[]> => {
    const response = await api.get<APIResponse<StudentParent[]>>(API_ENDPOINTS.STUDENT_PARENT.BY_STUDENT(studentId));
    return response.data.data ?? [];
  },

  // Get student by parentID
  getStudentsByParentId: async (parentId: number | string): Promise<StudentParent[]> => {
    const response = await api.get<APIResponse<StudentParent[]>>(API_ENDPOINTS.STUDENT_PARENT.BY_PARENT(parentId));
    return response.data.data ?? [];
  },

  // Assign relationship between student and parent
  linkStudentParent: async (studentId: number | string, parentData: { parentId: number; relationshipType: string; isPrimaryContact: boolean }): Promise<StudentParent> => {
    const response = await api.post<APIResponse<StudentParent>>(API_ENDPOINTS.STUDENT_PARENT.LINK(studentId), parentData);
    return response.data.data!;
  },

  // Update relationship between student and parent
  updateRelationship: async (studentId: number | string, parentId: number | string, relationshipData: { relationshipType?: string; isPrimaryContact?: boolean }): Promise<StudentParent> => {
    const response = await api.patch<APIResponse<StudentParent>>(API_ENDPOINTS.STUDENT_PARENT.UPDATE_RELATION(studentId, parentId), relationshipData);
    return response.data.data!;
  },

  // Delete relationship between student and parent
  deleteRelationship: async (studentId: number | string, parentId: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.STUDENT_PARENT.UPDATE_RELATION(studentId, parentId));
    return response.data.success;
  }
};

export default studentParentService;
