export interface User {
  _id: string;
  email: string;
  username: string;
  role: string;
  avatar: {
    _id: string;
    localPath: string;
    url: string;
  };
  isEmailVerified: boolean;
  loginType: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  };
  message: string;
  statusCode: number;
  success: boolean;
}
