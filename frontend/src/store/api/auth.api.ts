import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { LoginRequest, AuthResponse } from '../types/auth.types'
import { API_ENDPOINTS } from '../../config/api.config'

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: fetchBaseQuery({
		baseUrl: API_ENDPOINTS.auth,
		credentials: 'include',
		prepareHeaders: (headers, { endpoint }) => {
			const token = localStorage.getItem('token')
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			if (endpoint !== 'register') {
				headers.set('Content-Type', 'application/json')
			}
			return headers
		},
	}),
	tagTypes: ['Auth'],
	endpoints: (builder) => ({
		login: builder.mutation<AuthResponse, LoginRequest>({
			query: (credentials) => ({
				url: '/login',
				method: 'POST',
				body: credentials,
			}),
			invalidatesTags: ['Auth'],
		}),

		register: builder.mutation<
			AuthResponse,
			{ data: FormData; role: 'CLIENT' | 'TRAINER' }
		>({
			query: ({ data, role }) => ({
				url: `/signup?role=${role}`,
				method: 'POST',
				body: data,
				headers: {},
			}),
			invalidatesTags: ['Auth'],
		}),

		logout: builder.mutation<{ message: string }, void>({
			query: () => ({
				url: '/logout',
				method: 'POST',
			}),
			invalidatesTags: ['Auth'],
		}),

		refresh: builder.mutation<AuthResponse, void>({
			query: () => ({
				url: '/refresh',
				method: 'POST',
			}),
		}),
	}),
})

export const {
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useRefreshMutation,
} = authApi
