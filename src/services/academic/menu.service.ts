import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { APIResponse, DailyMenu } from '@/types';

export const menuService = {
  // Get all menus
  getAllMenus: async (): Promise<DailyMenu[]> => {
    const response = await api.get<APIResponse<DailyMenu[]>>(API_ENDPOINTS.MENUS.BASE);
    return response.data.data ?? [];
  },

  // Create new menu
  createMenu: async (menuData: Partial<DailyMenu>): Promise<DailyMenu> => {
    const response = await api.post<APIResponse<DailyMenu>>(API_ENDPOINTS.MENUS.BASE, menuData);
    return response.data.data!;
  },

  // Get menu by ID
  getMenuById: async (id: number | string): Promise<DailyMenu> => {
    const response = await api.get<APIResponse<DailyMenu>>(`${API_ENDPOINTS.MENUS.BASE}/${id}`);
    return response.data.data!;
  },

  // Update menu
  updateMenu: async (id: number | string, menuData: Partial<DailyMenu>): Promise<DailyMenu> => {
    const response = await api.put<APIResponse<DailyMenu>>(`${API_ENDPOINTS.MENUS.BASE}/${id}`, menuData);
    return response.data.data!;
  },

  // Delete menu
  deleteMenu: async (id: number | string): Promise<boolean> => {
    const response = await api.delete<APIResponse<any>>(`${API_ENDPOINTS.MENUS.BASE}/${id}`);
    return response.data.success;
  },

  // Get menus by class ID
  getMenusByClass: async (classId: number | string): Promise<DailyMenu[]> => {
    const response = await api.get<APIResponse<DailyMenu[]>>(API_ENDPOINTS.MENUS.BY_CLASS(classId));
    return response.data.data ?? [];
  }
};

export default menuService;
