import type { AuthUser, ClientUser } from './auth.types'
import type { NutritionPlans } from './nutrition.types'
import type { ProgressReport } from './progress.types'

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

export interface TrainerListItem {
	id: string
	name: string
	photo: string | null
	bio: string | null
	telegram: string | null
	whatsapp: string | null
	instagram: string | null
	// Статус приглашения (только для авторизованного клиента)
	inviteStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
}

export interface TrainerWithStatus extends TrainerListItem {
	inviteStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
	isMyTrainer: boolean
}

export interface InviteTrainerResponse {
	message: string
	invite: {
		id: string
		trainerId: string
		status: string
		createdAt: string
	}
}

export interface CancelTrainerResponse {
	message: string
	deactivatedNutritionPlans: number
}

export interface CancelInviteResponse {
	message: string
}

export interface UserState {
	profile: UserProfile | null
	bodyMeasurements: BodyMeasurement[]
	selectedMetric: keyof BodyMeasurement
	selectedPeriod: 'week' | 'month' | '3months' | 'year'
}
