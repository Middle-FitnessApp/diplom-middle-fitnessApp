export interface SignUpDTO {
  name: string
  email: string
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

export interface RegisterDTO {
  name: string
  email: string
  password: string
}

export interface PublicUser {
  id: string
  name: string
  email: string
}
