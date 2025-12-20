import type { ClientData, UserProfile } from '../types/user.types'
import type { ProgressReport } from '../types/progress.types'
import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQueryWithReauth } from './baseQuery'
import { API_ENDPOINTS } from '../../config/api.config'
import type {
	ExtendedClient,
	TrainerInvite,
	AcceptInviteResponse,
	RejectInviteResponse,
	ClientDetailedProfile,
	AllClientsResponse,
	TrainerStats,
} from '../types/trainer.types'

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
					if (import.meta.env.DEV) {
						console.error('Unexpected clients format:', clients)
					}
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
