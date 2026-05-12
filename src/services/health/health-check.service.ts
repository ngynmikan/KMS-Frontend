import api from '../api';
import { API_ENDPOINTS } from '../api.constants';

export interface HealthCheck {
  HealthCheckId?: number;
  StudentId: number;
  CheckDate: string;
  Height: number;
  Weight: number;
  Bmi?: number;
  EyeSight: string;
  DentalStatus: string;
  GeneralHealth: string;
  Note: string;
  CheckedBy: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface HealthCheckCreate {
  StudentId: number;
  CheckDate: string;
  Height: number;
  Weight: number;
  EyeSight: string;
  DentalStatus: string;
  GeneralHealth: string;
  Note: string;
  CheckedBy: string;
}

export interface HealthCheckUpdate {
  CheckDate?: string;
  Height?: number;
  Weight?: number;
  EyeSight?: string;
  DentalStatus?: string;
  GeneralHealth?: string;
  Note?: string;
  CheckedBy?: string;
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
