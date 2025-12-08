import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_ENDPOINTS } from '../../config/api.config'

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
	trainerComment?: string
	commentedAt?: string
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
}

export const progressApi = createApi({
	reducerPath: 'progressApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_ENDPOINTS.base,
		credentials: 'include',
		prepareHeaders: (headers, { endpoint }) => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}

			// Для мутации с файлами не устанавливаем Content-Type
			if (endpoint !== 'addProgressReport') {
				headers.set('Content-Type', 'application/json')
			}
			return headers
		},
	}),
	tagTypes: ['Progress'],
	endpoints: (builder) => ({
		// Получение всех отчетов прогресса для графика
		getProgressChartData: builder.query<ProgressChartData[], void>({
			query: () => '/progress',
			providesTags: ['Progress'],
			transformResponse: (response: { data: ProgressReport[]; meta: any }) => {
				return response.data.map((item) => ({
					date: item.date.split('T')[0],
					weight: item.weight,
					waist: item.waist,
					hips: item.hips,
					chest: item.chest || 0,
					arm: item.arm || 0,
					leg: item.leg || 0,
				}))
			},
		}),

		// Получение всех отчетов с полной информацией
		getProgressReports: builder.query<ProgressReport[], void>({
			query: () => '/progress',
			providesTags: ['Progress'],
			transformResponse: (response: { data: ProgressReport[]; meta: any }) => response.data,
		}),

		// Получение конкретного отчета по ID
		getProgressReport: builder.query<ProgressReport, string>({
			query: (id) => `/progress/${id}`,
			providesTags: ['Progress'],
			transformResponse: (response: { progress: ProgressReport }) => response.progress,
		}),

		// Создание нового отчета
		addProgressReport: builder.mutation<ProgressReport, FormData>({
			query: (formData) => ({
				url: '/progress/new-report',
				method: 'PUT',
				body: formData,
			}),
			invalidatesTags: ['Progress'],
		}),

		// Получение последнего отчета
		getLatestProgress: builder.query<ProgressReport, void>({
			query: () => '/progress/latest',
			transformResponse: (response: { progress: ProgressReport }) => response.progress,
		}),
	}),
})

export const {
	useGetProgressChartDataQuery,
	useGetProgressReportsQuery,
	useGetProgressReportQuery,
	useAddProgressReportMutation,
	useGetLatestProgressQuery,
} = progressApi
