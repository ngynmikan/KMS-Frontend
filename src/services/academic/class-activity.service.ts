import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { ApiClassActivity, ApiActivityPhoto, CreateActivityDTO, FlexibleResponse } from '@/types';

export const classActivityService = {
  // Get all class activities
  getAllActivities: async (): Promise<FlexibleResponse<ApiClassActivity[]>> => {
    const response = await api.get<FlexibleResponse<ApiClassActivity[]>>(API_ENDPOINTS.CLASS_ACTIVITIES.BASE);
    return response.data;
  },

  // Get activities by class ID
  getActivitiesByClass: async (classId: number | string): Promise<FlexibleResponse<ApiClassActivity[]>> => {
    const response = await api.get<FlexibleResponse<ApiClassActivity[]>>(API_ENDPOINTS.CLASS_ACTIVITIES.BY_CLASS(classId));
    return response.data;
  },

  // Get activity by ID
  getActivityById: async (id: number | string): Promise<FlexibleResponse<ApiClassActivity | null>> => {
    const response = await api.get<FlexibleResponse<ApiClassActivity>>(API_ENDPOINTS.CLASS_ACTIVITIES.BY_ID(id));
    return response.data;
  },

  // Create new activity
  createActivity: async (data: CreateActivityDTO): Promise<FlexibleResponse<ApiClassActivity>> => {
    const response = await api.post<FlexibleResponse<ApiClassActivity>>(API_ENDPOINTS.CLASS_ACTIVITIES.BASE, data);
    return response.data;
  },

  // Update existing activity
  updateActivity: async (id: number | string, data: Partial<CreateActivityDTO>): Promise<FlexibleResponse<ApiClassActivity>> => {
    const response = await api.put<FlexibleResponse<ApiClassActivity>>(API_ENDPOINTS.CLASS_ACTIVITIES.BY_ID(id), data);
    return response.data;
  },

  // Delete activity
  deleteActivity: async (id: number | string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS_ACTIVITIES.BY_ID(id));
  },

  // Get photos for an activity
  getActivityPhotos: async (activityId: number | string): Promise<FlexibleResponse<ApiActivityPhoto[]>> => {
    const response = await api.get<FlexibleResponse<ApiActivityPhoto[]>>(API_ENDPOINTS.CLASS_ACTIVITIES.PHOTOS(activityId));
    return response.data;
  },

  // Upload photo to an activity
  uploadActivityPhoto: async (activityId: number | string, data: FormData): Promise<FlexibleResponse<ApiActivityPhoto>> => {
    const response = await api.post<FlexibleResponse<ApiActivityPhoto>>(API_ENDPOINTS.CLASS_ACTIVITIES.PHOTOS(activityId), data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete a specific photo
  deleteActivityPhoto: async (photoId: number | string): Promise<void> => {
    await api.delete(API_ENDPOINTS.CLASS_ACTIVITIES.DELETE_PHOTO(photoId));
  }
};

export default classActivityService;
