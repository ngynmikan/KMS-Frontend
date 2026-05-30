import api from '../api';
import { API_ENDPOINTS } from '../api.constants';

export interface HealthCheck {
  id: number;
  studentId: number;
  checkDate: string;
  height: number;
  weight: number;
  bmi: number;
  eyesight: string;
  dental: string;
  generalHealth: string;
  notes: string;
  checkedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HealthCheckCreate {
  studentId: number;
  checkDate: string;
  height: number;
  weight: number;
  eyesight: string;
  dental: string;
  generalHealth: string;
  notes: string;
  checkedBy: string;
}

export interface HealthCheckUpdate {
  checkDate?: string;
  height?: number;
  weight?: number;
  eyesight?: string;
  dental?: string;
  generalHealth?: string;
  notes?: string;
  checkedBy?: string;
}

export const healthCheckService = {
  // Get all health checks
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.HEALTH_CHECKS.BASE);
    return response.data;
  },

  // Get a health check by ID
  getById: async (id: number | string) => {
    const response = await api.get(API_ENDPOINTS.HEALTH_CHECKS.BY_ID(id));
    return response.data;
  },

  // Get health checks by student ID
  getByStudent: async (studentId: number | string) => {
    const response = await api.get(API_ENDPOINTS.HEALTH_CHECKS.BY_STUDENT(studentId));
    return response.data;
  },

  // Create a new health check
  create: async (data: HealthCheckCreate) => {
    const response = await api.post(API_ENDPOINTS.HEALTH_CHECKS.BASE, data);
    return response.data;
  },

  // Update a health check
  update: async (id: number | string, data: HealthCheckUpdate) => {
    const response = await api.put(API_ENDPOINTS.HEALTH_CHECKS.BY_ID(id), data);
    return response.data;
  },

  // Delete a health check
  delete: async (id: number | string) => {
    const response = await api.delete(API_ENDPOINTS.HEALTH_CHECKS.BY_ID(id));
    return response.data;
  }
};
