interface RegisterBase {
  name: string
  emailOrPhone: string
  password: string
}

interface ClientFields {
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

interface TrainerFields {
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

export type RegisterDTO = RegisterClientDTO | RegisterTrainerDTO

export interface QuerystringRole {
	role: 'CLIENT' | 'TRAINER'
}

export interface LoginDTO {
	emailOrPhone: string
	password: string
}

interface Token {
	accessToken: string
}

export interface UserRole {
	role: QuerystringRole['role']
}

export interface RoleWithToken {
	user: UserRole
	token: Token
}

export interface RefreshBody {
	refreshToken: string
}
