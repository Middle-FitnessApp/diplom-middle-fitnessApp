import {
	createApi,
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import type {
	UpdateClientProfileRequest,
	UpdateProfileResponse,
	UpdateTrainerProfileRequest,
} from '../types/user.types'
import type { AuthUser, TrainerInfo } from '../types/auth.types'
import { API_ENDPOINTS } from '../../config/api.config'

// Тип для тренера в списке (с опциональным статусом приглашения)
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

// Тренер с информацией о статусе приглашения (для авторизованного клиента)
export interface TrainerWithStatus extends TrainerListItem {
	inviteStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null
	isMyTrainer: boolean
}

// Ответ на приглашение тренера
export interface InviteTrainerResponse {
	message: string
	invite: {
		id: string
		trainerId: string
		status: string
		createdAt: string
	}
}

// Ответ на отмену сотрудничества
export interface CancelTrainerResponse {
	message: string
	deletedNutritionPlans: number
}

const rawBaseQuery = fetchBaseQuery({
	baseUrl: API_ENDPOINTS.user,
	credentials: 'include',
	prepareHeaders: (headers, { endpoint, type }) => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
		if (token) {
			headers.set('authorization', `Bearer ${token}`)
		}

		const isJsonEndpoint = ['getMe'].includes(endpoint)

		if (isJsonEndpoint || type === 'query') {
			headers.set('Content-Type', 'application/json')
		}

		return headers
	},
})

export const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	let result = await rawBaseQuery(args, api, extraOptions)

	if (result.error && result.error.status === 401) {
		const refreshResult = await rawBaseQuery(
			{
				url: '/../auth/refresh',
				method: 'POST',
				credentials: 'include',
			},
			api,
			extraOptions,
		)

		if (refreshResult.data) {
			result = await rawBaseQuery(args, api, extraOptions)
		} else {
			if (typeof window !== 'undefined') {
				localStorage.removeItem('token')
				window.location.href = '/login'
			}
		}
	}

	return result
}

export const userApi = createApi({
	reducerPath: 'userApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['User', 'Trainers'],
	endpoints: (builder) => ({
		getMe: builder.query<{ user: AuthUser }, void>({
			query: () => '/me',
			providesTags: ['User'],
		}),

		// Получить список всех тренеров
		getAllTrainers: builder.query<{ trainers: TrainerListItem[] }, void>({
			query: () => '/../trainer/all',
			providesTags: ['Trainers'],
		}),

		// Получить тренера по ID (с информацией о статусе для клиента)
		getTrainerById: builder.query<{ trainer: TrainerWithStatus }, string>({
			query: (trainerId) => `/../trainer/${trainerId}`,
			providesTags: ['User'],
		}),

		// Отправить приглашение тренеру (привязать тренера)
		inviteTrainer: builder.mutation<InviteTrainerResponse, { trainerId: string }>({
			query: ({ trainerId }) => ({
				url: '/client/invite-trainer',
				method: 'POST',
				body: { trainerId },
			}),
			invalidatesTags: ['User', 'Trainers'],
		}),

		// Отвязать тренера
		cancelTrainer: builder.mutation<CancelTrainerResponse, void>({
			query: () => ({
				url: '/client/trainer',
				method: 'DELETE',
			}),
			invalidatesTags: ['User'],
		}),

		updateClientProfile: builder.mutation<
			UpdateProfileResponse,
			UpdateClientProfileRequest
		>({
			query: (data) => ({
				url: '/client/profile',
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: ['User'],
		}),

		updateTrainerProfile: builder.mutation<
			UpdateProfileResponse,
			UpdateTrainerProfileRequest
		>({
			query: (data) => ({
				url: '/trainer/profile',
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: ['User'],
		}),

		updateClientProfileWithPhoto: builder.mutation<UpdateProfileResponse, FormData>({
			query: (formData) => ({
				url: '/client/profile',
				method: 'PUT',
				body: formData,
			}),
			invalidatesTags: ['User'],
		}),

		updateTrainerProfileWithPhoto: builder.mutation<UpdateProfileResponse, FormData>({
			query: (formData) => ({
				url: '/trainer/profile',
				method: 'PUT',
				body: formData,
			}),
			invalidatesTags: ['User'],
		}),
	}),
})

export const {
	useGetMeQuery,
	useGetAllTrainersQuery,
	useGetTrainerByIdQuery,
	useInviteTrainerMutation,
	useCancelTrainerMutation,
	useUpdateClientProfileMutation,
	useUpdateTrainerProfileMutation,
	useUpdateClientProfileWithPhotoMutation,
	useUpdateTrainerProfileWithPhotoMutation,
} = userApi
