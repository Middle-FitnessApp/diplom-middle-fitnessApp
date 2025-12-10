import type { ClientData, UserProfile } from '../types/user.types'
import type { ProgressReport } from '../types/progress.types'
import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQueryWithReauth } from './baseQuery'
import { API_ENDPOINTS } from '../../config/api.config'

// Типы для приглашений
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

export const trainerApi = createApi({
	reducerPath: 'trainerApi',
	baseQuery: createBaseQueryWithReauth(API_ENDPOINTS.trainer),
	tagTypes: ['Clients', 'Client', 'Invites'],
	endpoints: (builder) => ({
		// Получить клиентов тренера (только ACCEPTED)
		getClients: builder.query<
			Array<{
				id: string
				name: string
				avatarUrl?: string
				isFavorite: boolean
				unreadMessages: number
				hasNewReport: boolean
				email?: string | null
				phone?: string | null
				age?: number
			}>,
			void
		>({
			query: () => '/clients',
			transformResponse: (resp: { clients: ExtendedClient[] } | ExtendedClient[]) => {
				// Обрабатываем разные форматы ответа
				const clients = Array.isArray(resp) ? resp : resp?.clients || []

				if (!Array.isArray(clients)) {
					console.error('Unexpected clients format:', clients)
					return []
				}

				return clients.map((client) => ({
					id: client.id,
					name: client.name,
					avatarUrl: client.photo || undefined,
					isFavorite: Boolean(client.isFavorite),
					unreadMessages: 0,
					hasNewReport: false,
					email: client.email,
					phone: client.phone,
					age: client.age,
				}))
			},
			providesTags: ['Clients'],
		}),

		// Получить приглашения (PENDING)
		getInvites: builder.query<{ invites: TrainerInvite[] }, { status?: string }>({
			query: ({ status = 'PENDING' }) => `/invites?status=${status}`,
			providesTags: ['Invites'],
		}),

		// Принять приглашение
		acceptInvite: builder.mutation<AcceptInviteResponse, { inviteId: string }>({
			query: ({ inviteId }) => ({
				url: `/invites/${inviteId}/accept`,
				method: 'POST',
				body: {},
			}),
			invalidatesTags: ['Invites', 'Clients'],
		}),

		// Отклонить приглашение
		rejectInvite: builder.mutation<RejectInviteResponse, { inviteId: string }>({
			query: ({ inviteId }) => ({
				url: `/invites/${inviteId}/reject`,
				method: 'POST',
				body: {},
			}),
			invalidatesTags: ['Invites'],
		}),

		// Переключить избранное
		toggleClientStar: builder.mutation<{ isFavorite: boolean }, { clientId: string }>({
			query: ({ clientId }) => ({
				url: `/clients/${clientId}/favorite`,
				method: 'PUT',
			}),
			invalidatesTags: ['Clients'],
		}),

		getClientProfile: builder.query<ClientData, { clientId: string }>({
			query: ({ clientId }) => `/clients/${clientId}`,
			providesTags: ['Client'],
		}),

		getClientProgress: builder.query<
			ProgressReport[],
			{ trainerId: string; clientId: string }
		>({
			query: ({ trainerId, clientId }) => `/${trainerId}/clients/${clientId}/progress`,
			providesTags: ['Client'],
		}),

		updateClientProfile: builder.mutation<
			UserProfile,
			{
				trainerId: string
				clientId: string
				profile: Partial<UserProfile>
			}
		>({
			query: ({ trainerId, clientId, profile }) => ({
				url: `/${trainerId}/clients/${clientId}/profile`,
				method: 'PUT',
				body: profile,
			}),
			invalidatesTags: ['Client'],
		}),

		addCommentToClientProgress: builder.mutation<
			void,
			{
				trainerId: string
				clientId: string
				progressId: string
				comment: string
			}
		>({
			query: ({ trainerId, clientId, progressId, comment }) => ({
				url: `/${trainerId}/clients/${clientId}/progress/${progressId}/comment`,
				method: 'POST',
				body: { comment },
			}),
			invalidatesTags: ['Client'],
		}),

		// Получить детальный профиль клиента для тренера
		getClientDetailedProfile: builder.query<ClientDetailedProfile, { clientId: string }>({
			query: ({ clientId }) => `/clients/${clientId}`,
			providesTags: ['Client'],
		}),

		// Получить всех клиентов системы с пагинацией
		getAllClients: builder.query<
			AllClientsResponse,
			{ search?: string; page?: number; limit?: number }
		>({
			query: ({ search, page = 1, limit = 12 }) => {
				const params = new URLSearchParams()
				if (search) params.append('search', search)
				params.append('page', page.toString())
				params.append('limit', limit.toString())
				return `/all-clients?${params.toString()}`
			},
			providesTags: ['Clients'],
		}),

		// Получить статистику тренера
		getTrainerStats: builder.query<TrainerStats, void>({
			query: () => '/stats',
			providesTags: ['Clients', 'Invites'],
		}),
	}),
})

export const {
	useGetClientsQuery,
	useGetInvitesQuery,
	useAcceptInviteMutation,
	useRejectInviteMutation,
	useToggleClientStarMutation,
	useGetClientProfileQuery,
	useGetClientProgressQuery,
	useUpdateClientProfileMutation,
	useAddCommentToClientProgressMutation,
	useGetClientDetailedProfileQuery,
	useGetAllClientsQuery,
	useGetTrainerStatsQuery,
} = trainerApi
