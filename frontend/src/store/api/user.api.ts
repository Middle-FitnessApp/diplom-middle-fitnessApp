import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQueryWithReauth } from './baseQuery'
import type {
	UpdateClientProfileRequest,
	UpdateProfileResponse,
	UpdateTrainerProfileRequest,
} from '../types/user.types'
import type { AuthUser } from '../types/auth.types'
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
	deactivatedNutritionPlans: number
}

// Ответ на отмену приглашения
export interface CancelInviteResponse {
	message: string
}

export const userApi = createApi({
	reducerPath: 'userApi',
	baseQuery: createBaseQueryWithReauth(API_ENDPOINTS.user),
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
			// Инвалидируем и User и Trainers, чтобы обновить статусы приглашений
			invalidatesTags: ['User', 'Trainers'],
		}),

		// Отменить приглашение тренеру
		cancelInvite: builder.mutation<CancelInviteResponse, { inviteId: string }>({
			query: ({ inviteId }) => ({
				url: `/client/invites/${inviteId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['User', 'Trainers'],
		}),

		// Отменить приглашение тренеру по ID тренера
		cancelInviteByTrainer: builder.mutation<CancelInviteResponse, { trainerId: string }>({
			query: ({ trainerId }) => ({
				url: `/client/invites/trainer/${trainerId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['User', 'Trainers'],
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
	useCancelInviteMutation,
	useCancelInviteByTrainerMutation,
	useUpdateClientProfileMutation,
	useUpdateTrainerProfileMutation,
	useUpdateClientProfileWithPhotoMutation,
	useUpdateTrainerProfileWithPhotoMutation,
} = userApi
