export interface UserRoleInfo {
  roleId: number;
  roleName: string;
}

export interface ManagedUser {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  avatar: string | null;
  isActive: boolean;
  phone: string;
  roles: UserRoleInfo[];
  createdAt?: string;
}

export interface UserManagementStats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}
