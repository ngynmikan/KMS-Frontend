import api from '../api';
import { API_ENDPOINTS } from '../api.constants';

export interface MedicalIncident {
  id: number;
  studentId: number;
  incidentDate: string;
  description: string;
  actionTaken: string;
  reportedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicalIncidentCreate {
  studentId: number;
  incidentDate: string;
  description: string;
  actionTaken: string;
  reportedBy: string;
}

export interface MedicalIncidentUpdate {
  incidentDate?: string;
  description?: string;
  actionTaken?: string;
  reportedBy?: string;
}

export const medicalIncidentService = {
  // Get all medical incidents
  getAll: async () => {
    const response = await api.get(API_ENDPOINTS.MEDICAL_INCIDENTS.BASE);
    return response.data;
  },

  // Get a medical incident by ID
  getById: async (id: number | string) => {
    const response = await api.get(API_ENDPOINTS.MEDICAL_INCIDENTS.BY_ID(id));
    return response.data;
  },

  // Get medical incidents by student ID
  getByStudent: async (studentId: number | string) => {
    const response = await api.get(API_ENDPOINTS.MEDICAL_INCIDENTS.BY_STUDENT(studentId));
    return response.data;
  },

  // Create a new medical incident
  create: async (data: MedicalIncidentCreate) => {
    const response = await api.post(API_ENDPOINTS.MEDICAL_INCIDENTS.BASE, data);
    return response.data;
  },

  // Update a medical incident
  update: async (id: number | string, data: MedicalIncidentUpdate) => {
    const response = await api.put(API_ENDPOINTS.MEDICAL_INCIDENTS.BY_ID(id), data);
    return response.data;
  },

  // Delete a medical incident
  delete: async (id: number | string) => {
    const response = await api.delete(API_ENDPOINTS.MEDICAL_INCIDENTS.BY_ID(id));
    return response.data;
  }
};
