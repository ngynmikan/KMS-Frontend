export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: {
      avatar: null
      email: string
      fullName: string
      isActive: boolean
      phone: string
      roles: string[]
      userId: number
      username: string
    };
  }

}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
}
