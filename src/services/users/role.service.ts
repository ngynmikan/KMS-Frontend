import api from '../api';
import { API_ENDPOINTS } from '../api.constants';
import { Role, RoleResponse, ManagedUser, APIResponse } from '@/types';

const roleService = {
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get<RoleResponse>(API_ENDPOINTS.USER_ROLE.ROLES);
    return response.data.data ?? [];
  },

  // Get role by roleId
  getRoleById: async (roleId: number): Promise<Role> => {
    const response = await api.get<APIResponse<Role>>(`${API_ENDPOINTS.USER_ROLE.ROLES}/${roleId}`);
    return response.data.data!;
  },

  // Get role of a specific user
  getUserRole: async (userId: number): Promise<Role> => {
    const response = await api.get<APIResponse<Role>>(`${API_ENDPOINTS.USER_ROLE.USERS}/${userId}/role`);
    return response.data.data!;
  },

  // Update user role
  updateUserRole: async (userId: number, roleName: string): Promise<any> => {
    const response = await api.put(`${API_ENDPOINTS.USER_ROLE.USERS}/${userId}/role`, null, {
      params: { roleName }
    });
    return response.data;
  },

  // Remove user role
  removeUserRole: async (userId: number): Promise<any> => {
    const response = await api.delete(`${API_ENDPOINTS.USER_ROLE.USERS}/${userId}/role`);
    return response.data;
  },

  // Assign role(roleId) by userId
  assignRoleById: async (userId: number, roleId: number): Promise<any> => {
    const response = await api.post(`${API_ENDPOINTS.USER_ROLE.USERS}/${userId}/roles`, null, {
      params: { roleId }
    });
    return response.data;
  },

  // Assign role(roleName) by userId
  assignRoleByName: async (userId: number, roleName: string): Promise<any> => {
    const response = await api.post(`${API_ENDPOINTS.USER_ROLE.USERS}/${userId}/roles/by-name`, null, {
      params: { roleName }
    });
    return response.data;
  },

  // List users by roleId
  getUsersByRoleId: async (roleId: number): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(`${API_ENDPOINTS.USER_ROLE.ROLES}/${roleId}/users`);
    return response.data.data ?? [];
  },

  // List users by roleName
  getUsersByRoleName: async (roleName: string): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(`${API_ENDPOINTS.USER_ROLE.ROLES}/by-name/${roleName}/users`);
    return response.data.data ?? [];
  },

  // Get all users without any role
  getUsersWithoutRole: async (): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(`${API_ENDPOINTS.USER_ROLE.USERS}/without-role`);
    return response.data.data ?? [];
  },

  // Get active users without role
  getActiveUsersWithoutRole: async (): Promise<ManagedUser[]> => {
    const response = await api.get<APIResponse<ManagedUser[]>>(`${API_ENDPOINTS.USER_ROLE.USERS}/active-without-role`);
    return response.data.data ?? [];
  },

  // Get role statistics
  getStatistics: async (): Promise<any[]> => {
    const response = await api.get<APIResponse<any[]>>(API_ENDPOINTS.USER_ROLE.STATISTICS);
    return response.data.data ?? [];
  },
};

export default roleService;
