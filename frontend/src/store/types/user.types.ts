import type { ProgressReport } from '../api/progress.api'
import type { AuthUser, ClientUser } from './auth.types'
import type { NutritionPlans } from './nutrition.types'

export interface UserProfile {
	id: string
	userId: string
}

export interface BodyMeasurement {
	id: string
	userId: string
	date: string
	weight: number
	waistCircumference?: number
	chestCircumference?: number
	hipCircumference?: number
	armCircumference?: number
	legCircumference?: number
}

export interface ProgressEntry {
	id: string
	userId: string
	date: string
	measurements: BodyMeasurement
	notes?: string
	photos?: string[]
}

export interface UpdateClientProfileRequest {
	name?: string
	email?: string
	phone?: string
	age?: number
}

export interface UpdateTrainerProfileRequest extends UpdateClientProfileRequest {
	bio?: string
	telegram?: string
	whatsapp?: string
	instagram?: string
}

export interface UpdateProfileResponse {
	message: string
	user: AuthUser
}

export interface ClientData {
	client: ClientUser
	lastProgress: ProgressReport | null
	nutritionPlans: NutritionPlans[]
	statistics: {
		dynamics: Dynamic
		totalReports: number
	}
}

export interface Dynamic {
	hipsChange: number
	waistChange: number
	weightChange: number
	periodDays: number
}
