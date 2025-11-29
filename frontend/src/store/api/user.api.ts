import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	UpdateClientProfileRequest,
	UpdateProfileResponse,
	UpdateTrainerProfileRequest,
} from '../types/user.types'
import type { AuthUser } from '../types/auth.types'

export const userApi = createApi({
	reducerPath: 'userApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://localhost:3000/api/user',
		credentials: 'include',
		prepareHeaders: (headers, { endpoint }) => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			if (
				endpoint !== 'updateClientProfileWithPhoto' &&
				endpoint !== 'updateTrainerProfileWithPhoto'
			) {
				headers.set('Content-Type', 'application/json')
			}
			return headers
		},
	}),
	tagTypes: ['User'],
	endpoints: (builder) => ({
		getMe: builder.query<{ user: AuthUser }, void>({
			query: () => '/me',
			providesTags: ['User'],
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
				formData: true,
			}),
			invalidatesTags: ['User'],
		}),

		updateTrainerProfileWithPhoto: builder.mutation<UpdateProfileResponse, FormData>({
			query: (formData) => ({
				url: '/trainer/profile',
				method: 'PUT',
				body: formData,
				formData: true,
			}),
			invalidatesTags: ['User'],
		}),
	}),
})

export const {
	useGetMeQuery,
	useUpdateClientProfileMutation,
	useUpdateTrainerProfileMutation,
	useUpdateClientProfileWithPhotoMutation,
	useUpdateTrainerProfileWithPhotoMutation,
} = userApi
