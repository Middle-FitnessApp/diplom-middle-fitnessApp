// store/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'trainer' | 'admin';
  avatar?: string;
  phone?: string;
  telegram?: string;
  whatsapp?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'client' | 'trainer';
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Добавляем тип для ошибок RTK Query
export interface ApiError {
  status: number;
  data: {
    message: string;
    code?: string;
  };
}