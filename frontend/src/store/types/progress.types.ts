import type { BodyMeasurement } from './user.types'

export interface ProgressComment {
	id: string
	progressEntryId: string
	trainerId: string
	trainerName: string
	comment: string
	createdAt: string
}

export interface ProgressReport {
	id: string
	userId: string
	date: string
	measurements: BodyMeasurement
	photos: string[]
	notes?: string
	comments: ProgressComment[]
}

export interface ProgressChartData {
	date: string
	weight: number
	waistCircumference?: number
	chestCircumference?: number
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
