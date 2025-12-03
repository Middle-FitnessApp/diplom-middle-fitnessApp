import type { UserProfile } from '../types/user.types'
import type { ProgressReport } from '../types/progress.types'
import type { AuthUser } from '../types/auth.types'
import {
	createApi,
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: 'http://localhost:3000/api/trainer',
	credentials: 'include',
	prepareHeaders: (headers) => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
		if (token) {
			headers.set('authorization', `Bearer ${token}`)
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

export const trainerApi = createApi({
	reducerPath: 'trainerApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Clients', 'Client'],
	endpoints: (builder) => ({
		//  Получение всех клиентов тренера (все CLIENT + starred флаги)
		// В trainer.api.ts — добавить computed поля
		getClients: builder.query<
			Array<{
				id: string
				name: string
				avatarUrl?: string
				starred: boolean
				unreadMessages: number
				hasNewReport: boolean
			}>,
			void
		>({
			query: () => '/clients',
			transformResponse: (resp: { clients: AuthUser[] }) => {
				return resp.clients.map((client) => ({
					id: client.id,
					name: client.name,
					avatarUrl: client.photo || undefined,
					starred: Boolean(client.starred),
					unreadMessages: 0,
					hasNewReport: false,
				}))
			},
			providesTags: ['Clients'],
		}),

		// Переключение starred статуса клиента
		toggleClientStar: builder.mutation<{ starred: boolean }, { clientId: string }>({
			query: ({ clientId }) => ({
				url: `/clients/${clientId}/star`,
				method: 'PATCH',
			}),
			invalidatesTags: ['Clients'], // Автоматически перезагружает getClients
		}),

		// Для страницы /admin/client/:id (профиль клиента)
		getClientProfile: builder.query<UserProfile, { trainerId: string; clientId: string }>(
			{
				query: ({ trainerId, clientId }) => `/${trainerId}/clients/${clientId}/profile`,
				providesTags: ['Client'],
			},
		),

		// Для страницы /admin/client/:id (прогресс клиента)
		getClientProgress: builder.query<
			ProgressReport[],
			{ trainerId: string; clientId: string }
		>({
			query: ({ trainerId, clientId }) => `/${trainerId}/clients/${clientId}/progress`,
			providesTags: ['Client'],
		}),

		// Для обновления профиля клиента тренером
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

		// Для добавления комментария к прогрессу клиента
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
	}),
})

export const {
	useGetClientsQuery,
	useToggleClientStarMutation,
	useGetClientProfileQuery,
	useGetClientProgressQuery,
	useUpdateClientProfileMutation,
	useAddCommentToClientProgressMutation,
} = trainerApi
