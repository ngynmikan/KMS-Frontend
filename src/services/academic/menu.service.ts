import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { FlexibleResponse, ApiMenu } from '@/types';

export const menuService = {
  // Get all menus
  getAllMenus: async (): Promise<FlexibleResponse<ApiMenu[]>> => {
    const response = await api.get<FlexibleResponse<ApiMenu[]>>(API_ENDPOINTS.MENUS.BASE);
    return response.data;
  },

  // Create new menu
  createMenu: async (menuData: Partial<ApiMenu>): Promise<FlexibleResponse<ApiMenu>> => {
    const response = await api.post<FlexibleResponse<ApiMenu>>(API_ENDPOINTS.MENUS.BASE, menuData);
    return response.data;
  },

  // Get menu by ID
  getMenuById: async (id: number | string): Promise<FlexibleResponse<ApiMenu>> => {
    const response = await api.get<FlexibleResponse<ApiMenu>>(`${API_ENDPOINTS.MENUS.BASE}/${id}`);
    return response.data;
  },

  // Update menu
  updateMenu: async (id: number | string, menuData: Partial<ApiMenu>): Promise<FlexibleResponse<ApiMenu>> => {
    const response = await api.put<FlexibleResponse<ApiMenu>>(`${API_ENDPOINTS.MENUS.BASE}/${id}`, menuData);
    return response.data;
  },

  // Delete menu
  deleteMenu: async (id: number | string): Promise<FlexibleResponse<any>> => {
    const response = await api.delete<FlexibleResponse<any>>(`${API_ENDPOINTS.MENUS.BASE}/${id}`);
    return response.data;
  },

  // Get menus by class ID
  getMenusByClass: async (classId: number | string): Promise<FlexibleResponse<ApiMenu[]>> => {
    const response = await api.get<FlexibleResponse<ApiMenu[]>>(API_ENDPOINTS.MENUS.BY_CLASS(classId));
    return response.data;
  }
};

export default menuService;
