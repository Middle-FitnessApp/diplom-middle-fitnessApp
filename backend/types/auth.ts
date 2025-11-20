export interface RegisterDTO {
	name: string
	emailOrPhone: string
	password: string
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

export interface LoginDTO {
	emailOrPhone: string
	password: string
}

interface Token {
	accessToken: string
	refreshToken: string
}

export interface PublicUser {
	id: string
	name: string
	email: string | null
	phone: string | null
}
export interface UserWithToken {
	user: PublicUser
	token: Token
}
