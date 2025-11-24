// Основные типы аутентификации
export interface LoginRequest {
  emailOrPhone: string
  password: string
}

export interface RegisterBase {
  name: string
  emailOrPhone: string
  password: string
}

// Дополнительные поля для клиента
export interface ClientFields {
  age?: number
  weight?: number
  height?: number
  waist?: number
  chest?: number
  hips?: number
  arm?: number
  leg?: number
  goal?: string
  restrictions?: string
  experience?: string
  diet?: string
  photoFront?: string
  photoSide?: string
  photoBack?: string
}

// Дополнительные поля для тренера
export interface TrainerFields {
  telegram?: string
  whatsapp?: string
  instagram?: string
  bio?: string
}

// Объединенные типы для регистрации
export interface RegisterClientDTO extends RegisterBase, ClientFields {
  role: 'CLIENT'
}

export interface RegisterTrainerDTO extends RegisterBase, TrainerFields {
  role: 'TRAINER'
}

export type RegisterRequest = RegisterClientDTO | RegisterTrainerDTO

// Ответ от сервера
export interface UserRole {
  role: 'CLIENT' | 'TRAINER'
}

export interface Token {
  accessToken: string
}

export interface AuthResponse {
  user: UserRole
  token: Token
}

// Состояние авторизации в Redux
export interface AuthState {
  user: UserRole | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Тип для ошибок API
export interface ApiError {
  status: number
  data: {
    message: string
    error?: string
    statusCode?: number
  }
}