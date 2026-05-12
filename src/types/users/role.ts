export interface Role {
  roleId: number;
  roleName: string;
  description: string;
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: Role[];
}
