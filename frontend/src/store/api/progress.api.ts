import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQueryWithReauth } from './baseQuery'
import { API_ENDPOINTS } from '../../config/api.config'
import type {
	CommentsResponse,
	Comment,
	ProgressAnalyticsResponse,
	ProgressReport,
	ProgressChartData,
	ProgressReportsResponse,
	ProgressReportResponse,
	CreateProgressResponse,
} from '../types/progress.types'

export const progressApi = createApi({
	reducerPath: 'progressApi',
	baseQuery: createBaseQueryWithReauth(API_ENDPOINTS.base),
	tagTypes: ['Progress'],
	endpoints: (builder) => ({
		// Получение всех отчетов прогресса для графика
		getProgressChartData: builder.query<ProgressChartData[], void>({
			query: () => '/progress',
			providesTags: ['Progress'],
			transformResponse: (response: ProgressReportsResponse) => {
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
			transformResponse: (response: ProgressReportsResponse) => response.data,
		}),

		// Получение всех отчетов для тренера по конкретному клиенту с пагинацией и фильтрацией по дате
		getTrainerClientReports: builder.query<
			ProgressReportsResponse,
			{
				clientId: string // обязательно!
				page?: number
				limit?: number
				startDate?: string // формат: 'DD/MM/YYYY'
				endDate?: string
			}
		>({
			query: ({ clientId, page = 1, limit = 5, startDate, endDate }) => {
				const params = new URLSearchParams()
				params.append('clientId', clientId)
				params.append('page', page.toString())
				params.append('limit', limit.toString())

				if (startDate) params.append('startDate', startDate)
				if (endDate) params.append('endDate', endDate)

				return `/progress?${params.toString()}`
			},
			providesTags: ['Progress'],
		}),

		// Получение конкретного отчета по ID
		getProgressReport: builder.query<ProgressReport, string>({
			query: (id) => `/progress/${id}`,
			providesTags: ['Progress'],
			transformResponse: (response: ProgressReportResponse) => response.progress,
		}),

		// Получение конкретного отчета по ID для тренера с указанием clientId
		getTrainerProgressReport: builder.query<
			ProgressReport,
			{ reportId: string; clientId: string }
		>({
			query: ({ reportId, clientId }) => ({
				url: `/progress/${reportId}`,
				params: { clientId }, // → /progress/123?clientId=abc
			}),
			providesTags: ['Progress'],
			transformResponse: (response: ProgressReportResponse) => response.progress,
		}),

		// Создание нового отчета
		addProgressReport: builder.mutation<ProgressReport, FormData>({
			query: (formData) => ({
				url: '/progress/new-report',
				method: 'PUT',
				body: formData,
				// Для FormData НЕ устанавливаем Content-Type
			}),
			invalidatesTags: ['Progress'],
			transformResponse: (response: CreateProgressResponse) => response.progress,
		}),

		// Получение последнего отчета
		getLatestProgress: builder.query<ProgressReport, void>({
			query: () => '/progress/latest',
			transformResponse: (response: ProgressReportResponse) => response.progress,
		}),

		getProgressAnalytics: builder.query<
			ProgressAnalyticsResponse,
			{
				period: string
				metrics: string[]
				startDate?: string
				endDate?: string
				clientId?: string
			}
		>({
			query: (params) => ({
				url: '/progress/analytics',
				method: 'GET',
				params,
			}),
		}),

		getProgressComments: builder.query<
			CommentsResponse,
			{ progressId: string; page?: number; limit?: number }
		>({
			query: ({ progressId, page = 1, limit = 10 }) => ({
				url: `/progress/${progressId}/comments`,
				params: { page, limit },
			}),
			providesTags: ['Progress'],
		}),

		addProgressComment: builder.mutation<Comment, { progressId: string; text: string }>({
			query: ({ progressId, text }) => ({
				url: `/progress/${progressId}/comments`,
				method: 'POST',
				body: { text },
			}),
			invalidatesTags: ['Progress'],
		}),
	}),
})

export const {
	useGetProgressChartDataQuery,
	useGetProgressReportsQuery,
	useGetTrainerClientReportsQuery,
	useGetProgressReportQuery,
	useGetTrainerProgressReportQuery,
	useAddProgressReportMutation,
	useGetLatestProgressQuery,
	useGetProgressAnalyticsQuery,
	useGetProgressCommentsQuery,
	useAddProgressCommentMutation,
} = progressApi
