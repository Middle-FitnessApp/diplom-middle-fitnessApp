export interface LoginRequest {
	emailOrPhone: string
	password: string
}

export interface RegisterBase {
	name: string
	emailOrPhone: string
	password: string
}

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
export interface TrainerFields {
	telegram?: string
	whatsapp?: string
	instagram?: string
	bio?: string
}

export interface RegisterClientDTO extends RegisterBase, ClientFields {
	role: 'CLIENT'
}

export interface RegisterTrainerDTO extends RegisterBase, TrainerFields {
	role: 'TRAINER'
}

export type RegisterRequest = RegisterClientDTO | RegisterTrainerDTO

export interface UserRole {
	role: 'CLIENT' | 'TRAINER'
}

export interface Token {
	accessToken: string
	refreshToken?: string
}

export interface AuthResponse {
	user: UserRole
	token: Token
}

export interface AuthUser {
	id: string
	name: string
	email: string | null
	phone: string | null
	age: number
	role: 'CLIENT' | 'TRAINER'
	photo: string | null
	createdAt?: string
	updatedAt?: string
	// Дополнительные поля для тренера
	bio?: string
	telegram?: string
	whatsapp?: string
	instagram?: string
}

export interface AuthState {
	user: AuthUser | null
	token: string | null
	isAuthenticated: boolean
	isLoading: boolean
}

export interface ApiError {
	status: number
	data: {
		message: string
		error?: string
		statusCode?: number
	}
}
