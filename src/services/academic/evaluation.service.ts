import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { 
  ApiEvaluation, 
  ApiEvaluationCriteria, 
  CreateEvaluationRequest, 
  UpdateEvaluationRequest,
  ClassEvaluationSummary
} from '@/types/academic/evaluation';
import { APIResponse } from '@/types/common/common';

export const evaluationService = {
  // Get evaluations for a student
  getByStudent: async (studentId: number | string, periodType?: string): Promise<ApiEvaluation[]> => {
    const url = API_ENDPOINTS.EVALUATION.STUDENT_BASE(studentId);
    const response = await api.get<APIResponse<ApiEvaluation[]>>(url, { params: { periodType } });
    return response.data.data ?? [];
  },

  // Get evaluation by ID
  getById: async (studentId: number | string, evaluationId: number | string): Promise<ApiEvaluation | null> => {
    const url = API_ENDPOINTS.EVALUATION.BY_ID(studentId, evaluationId);
    const response = await api.get<APIResponse<ApiEvaluation>>(url);
    return response.data.data ?? null;
  },

  // Create evaluation
  create: async (studentId: number | string, request: CreateEvaluationRequest): Promise<ApiEvaluation> => {
    const url = API_ENDPOINTS.EVALUATION.STUDENT_BASE(studentId);
    const response = await api.post<APIResponse<ApiEvaluation>>(url, request);
    return response.data.data!;
  },

  // Update evaluation
  update: async (studentId: number | string, evaluationId: number | string, request: UpdateEvaluationRequest): Promise<ApiEvaluation> => {
    const url = API_ENDPOINTS.EVALUATION.BY_ID(studentId, evaluationId);
    const response = await api.put<APIResponse<ApiEvaluation>>(url, request);
    return response.data.data!;
  },

  // Get all evaluation criteria
  getAllCriteria: async (activeOnly: boolean = true): Promise<ApiEvaluationCriteria[]> => {
    const response = await api.get<APIResponse<ApiEvaluationCriteria[]>>(API_ENDPOINTS.EVALUATION.CRITERIA, { params: { activeOnly } });
    return response.data.data ?? [];
  },

  // Get class evaluation summary
  getClassSummary: async (classId: number | string, periodType: string, periodStart: string): Promise<ClassEvaluationSummary | null> => {
    const url = API_ENDPOINTS.EVALUATION.CLASS_SUMMARY(classId);
    const response = await api.get<APIResponse<ClassEvaluationSummary>>(url, { params: { periodType, periodStart } });
    return response.data.data ?? null;
  },

  // Get good students for a class
  getGoodStudents: async (classId: number | string, periodType: string, periodStart: string): Promise<any[]> => {
    const url = API_ENDPOINTS.EVALUATION.GOOD_STUDENTS(classId);
    const response = await api.get<APIResponse<any[]>>(url, { params: { periodType, periodStart } });
    return response.data.data ?? [];
  },
};

export default evaluationService;
