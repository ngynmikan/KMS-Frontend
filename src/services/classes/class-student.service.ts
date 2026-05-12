import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ClassStudent, APIResponse, EnrollMultipleRequest, TransferRequest } from '@/types';

export const classStudentService = {
  // Get list student by classID
  getStudentsByClass: async (classId: number | string): Promise<ClassStudent[]> => {
    const response = await api.get<APIResponse<ClassStudent[]>>(API_ENDPOINTS.CLASS_STUDENT.BY_CLASS(classId));
    return response.data.data ?? [];
  },

  // Get list class by studentID
  getClassesByStudent: async (studentId: number | string): Promise<ClassStudent[]> => {
    const response = await api.get<APIResponse<ClassStudent[]>>(API_ENDPOINTS.CLASS_STUDENT.BY_STUDENT(studentId));
    return response.data.data ?? [];
  },

  // Assign student to class
  enrollStudent: async (classId: number | string, studentData: { studentId: number }): Promise<ClassStudent> => {
    const response = await api.post<APIResponse<ClassStudent>>(API_ENDPOINTS.CLASS_STUDENT.ENROLL(classId), studentData);
    return response.data.data!;
  },

  // Assign multiple students to class
  enrollMultipleStudents: async (classId: number | string, studentIds: number[]): Promise<boolean> => {
    const request: EnrollMultipleRequest = { studentIds };
    const response = await api.post<APIResponse<any>>(API_ENDPOINTS.CLASS_STUDENT.ENROLL_MULTIPLE(classId), request);
    return response.data.success;
  },

  // Delete student from class
  removeStudentFromClass: async (classId: number | string, studentId: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(API_ENDPOINTS.CLASS_STUDENT.REMOVE(classId, studentId));
    return response.data.success;
  },

  // Switch student to another class
  transferStudent: async (studentId: number | string, newClassId: number): Promise<boolean> => {
    const request: TransferRequest = { newClassId };
    const response = await api.post<APIResponse<any>>(API_ENDPOINTS.CLASS_STUDENT.TRANSFER(studentId), request);
    return response.data.success;
  }
};

export default classStudentService;
