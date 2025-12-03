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
import type { AuthUser } from '../types/auth.types'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: 'http://localhost:3000/api/user',
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
	string | FetchArgs, // аргументы: url либо объект запроса
	unknown, // тип data (конкретизируется в endpoints)
	FetchBaseQueryError // тип ошибки
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

		// ✅ FormData мутации для фото (используют существующие роуты)
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
	useUpdateClientProfileMutation,
	useUpdateTrainerProfileMutation,
	useUpdateClientProfileWithPhotoMutation,
	useUpdateTrainerProfileWithPhotoMutation,
} = userApi
