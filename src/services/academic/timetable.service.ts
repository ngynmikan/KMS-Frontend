import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiTimetable, CreateTimetableRequest, UpdateTimetableRequest, FlexibleResponse } from '@/types';

export const timetableService = {
  // Get a timetable entry by ID
  getById: async (id: number | string) => {
    const response = await api.get(API_ENDPOINTS.TIMETABLE.BY_ID(id));
    return response.data;
  },

  // Get timetable by class ID
  getByClass: async (classId: number | string): Promise<FlexibleResponse<ApiTimetable[]>> => {
    const response = await api.get<FlexibleResponse<ApiTimetable[]>>(API_ENDPOINTS.TIMETABLE.BY_CLASS(classId));
    return response.data;
  },

  // Get timetable by teacher ID
  getByTeacher: async (teacherId: number | string): Promise<FlexibleResponse<ApiTimetable[]>> => {
    const response = await api.get<FlexibleResponse<ApiTimetable[]>>(API_ENDPOINTS.TIMETABLE.BY_TEACHER(teacherId));
    return response.data;
  },

  // Create new timetable entry
  create: async (data: CreateTimetableRequest): Promise<FlexibleResponse<ApiTimetable>> => {
    const response = await api.post<FlexibleResponse<ApiTimetable>>(API_ENDPOINTS.TIMETABLE.BASE, data);
    return response.data;
  },

  // Update timetable entry
  update: async (id: number | string, data: UpdateTimetableRequest): Promise<FlexibleResponse<ApiTimetable>> => {
    const response = await api.put<FlexibleResponse<ApiTimetable>>(API_ENDPOINTS.TIMETABLE.BY_ID(id), data);
    return response.data;
  },

  // Delete timetable entry
  delete: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(API_ENDPOINTS.TIMETABLE.BY_ID(id));
    return response.data;
  },
};

export default timetableService;
