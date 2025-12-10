import {
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { API_ENDPOINTS } from '../../config/api.config'

export const createBaseQueryWithReauth = (baseUrl: string) => {
	const rawBaseQuery = fetchBaseQuery({
		baseUrl,
		credentials: 'include',
		prepareHeaders: (headers) => {
			const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
			if (token) {
				headers.set('authorization', `Bearer ${token}`)
			}
			return headers
		},
	})

	const baseQueryWithReauth: BaseQueryFn<
		string | FetchArgs,
		unknown,
		FetchBaseQueryError
	> = async (args, api, extraOptions) => {
		let result = await rawBaseQuery(args, api, extraOptions)

		if (result.error && result.error.status === 401) {
			const refreshResult = await fetchBaseQuery({
				baseUrl: API_ENDPOINTS.auth,
				credentials: 'include',
			})(
				{
					url: '/refresh',
					method: 'POST',
					credentials: 'include',
				},
				api,
				extraOptions,
			)

			if (refreshResult.data) {
				// Сохраняем новый access token в localStorage
				const data = refreshResult.data as { token?: { accessToken?: string } }
				if (data.token?.accessToken) {
					localStorage.setItem('token', data.token.accessToken)

					// Повторяем оригинальный запрос с новым токеном
					result = await rawBaseQuery(args, api, extraOptions)
				} else {
					console.error('В ответе обновления отсутствует токен доступа')
				}
			} else {
				if (typeof window !== 'undefined') {
					localStorage.removeItem('token')
					window.location.href = '/login'
				}
			}
		}

		return result
	}

	return baseQueryWithReauth
}
