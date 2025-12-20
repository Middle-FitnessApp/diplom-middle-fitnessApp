export interface InviteClient {
	id: string
	name: string
	photo: string | null
	age: number
	goal: string | null
}

export interface TrainerInvite {
	id: string
	status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
	createdAt: string
	client: InviteClient
}

export interface AcceptInviteResponse {
	message: string
	client: {
		id: string
		name: string
		photo: string | null
		isFavorite: boolean
	}
}

export interface RejectInviteResponse {
	message: string
}

// Типы для детального профиля клиента
export interface ClientDetailedProfile {
	client: {
		id: string
		name: string
		email: string | null
		phone: string | null
		photo: string | null
		age: number
		goal: string | null
		restrictions: string | null
		experience: string | null
		diet: string | null
		createdAt: string
	}
	lastProgress: {
		id: string
		date: string
		weight: number
		waist: number
		hips: number
		height: number | null
		chest: number | null
		arm: number | null
		leg: number | null
		photoFront: string | null
		photoSide: string | null
		photoBack: string | null
		createdAt: string
	} | null
	statistics: {
		totalReports: number
		dynamics: {
			weightChange: number
			waistChange: number
			hipsChange: number
			periodDays: number
		} | null
	}
	nutritionPlans: Array<{
		id: string
		categoryName: string
		subcategoryName: string
		subcategoryDescription: string | null
		assignedDays: string[]
		assignedAt: string
	}>
}

// Тип для расширенного списка клиентов
export interface ExtendedClient {
	id: string
	email: string | null
	name: string
	age: number
	phone: string | null
	photo: string | null
	role: string
	isFavorite: boolean
}

// Тип для клиента из списка всех клиентов системы
export interface AllSystemClient {
	id: string
	email: string | null
	name: string
	age: number
	phone: string | null
	photo: string | null
	goal: string | null
	createdAt: string
	relationshipStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
	isFavorite: boolean
}

// Тип для пагинации
export interface Pagination {
	page: number
	limit: number
	total: number
	totalPages: number
}

// Тип для ответа со всеми клиентами
export interface AllClientsResponse {
	clients: AllSystemClient[]
	pagination: Pagination
}

// Тип для статистики тренера
export interface TrainerStats {
	nutritionCategories: number
	nutritionPlans: number
	activeNutritionPlans: number
	acceptedClients: number
	pendingInvites: number
	favoriteClients: number
}
