export interface ProgressReport {
	id: string
	date: string
	weight: number
	height?: number
	chest?: number
	waist: number
	hips: number
	arm?: number
	leg?: number
	photoFront?: string
	photoSide?: string
	photoBack?: string
	comments?: Comment[]
	createdAt: string
	updatedAt: string
}

export interface ProgressChartData {
	date: string
	weight: number
	waist: number
	hips: number
	chest?: number
	arm?: number
	leg?: number
	[key: string]: string | number | boolean | undefined
}

export interface ProgressAnalyticsResponse {
	period: string
	dateRange: {
		from: string
		to: string
	}
	metrics: Array<{
		metric: string
		data: Array<{ date: string; value: number }>
		min: number | null
		max: number | null
		avg: number | null
		change: number | null
	}>
}

export interface Comment {
	id: string
	text: string
	createdAt: string
	progressId: string
	trainerId: string
	trainer: {
		id: string
		name: string
		email: string
		photo?: string
	}
}

export interface CommentsResponse {
	comments: Comment[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface PaginationMeta {
	page: number
	limit: number
	total: number
	totalPages: number
}

// Ответ от API с пагинацией
export interface ProgressReportsResponse {
	data: ProgressReport[]
	meta: PaginationMeta
}

// Ответ от API для одного отчёта
export interface ProgressReportResponse {
	progress: ProgressReport
}

// Ответ от API при создании отчёта
export interface CreateProgressResponse {
	message: string
	progress: ProgressReport
}
