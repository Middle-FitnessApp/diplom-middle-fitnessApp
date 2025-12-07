import type {
	NutritionCategory,
	NutritionSubcategory,
	NutritionDay,
	AssignedNutritionPlan,
	ClientNutritionPlanResponse,
} from '../types/nutrition.types'
import {
	createApi,
	fetchBaseQuery,
	type BaseQueryFn,
	type FetchArgs,
	type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { API_ENDPOINTS } from '../../config/api.config'

const rawBaseQuery = fetchBaseQuery({
	baseUrl: API_ENDPOINTS.base,
	credentials: 'include',
	prepareHeaders: (headers) => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
		if (token) {
			headers.set('authorization', `Bearer ${token}`)
		}

		// const isFormDataEndpoint = [
		// 	'updateClientProfileWithPhoto',
		// 	'updateTrainerProfileWithPhoto',
		// ].includes(endpoint)

		// const isJsonMutation =
		// 	!isFormDataEndpoint && type === 'mutation' && !endpoint.includes('WithPhoto')

		// if (isJsonMutation) {
		// 	headers.set('Content-Type', 'application/json')
		// }

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
		} else if (typeof window !== 'undefined') {
			localStorage.removeItem('token')
			window.location.href = '/login'
		}
	}

	return result
}

export const nutritionApi = createApi({
	reducerPath: 'nutritionApi',
	baseQuery: baseQueryWithReauth,
	tagTypes: ['Category', 'Subcategory', 'Day', 'AssignedPlan'],
	endpoints: (builder) => ({
		// План питания текущего клиента
		getClientNutritionPlan: builder.query<ClientNutritionPlanResponse, { period?: 'day' | 'week' | 'month'; date?: string } | void>({
			query: (params) => ({
				url: '/nutrition/client/plan',
				params: params || undefined,
			}),
			providesTags: ['AssignedPlan', 'Day'],
		}),

		// === КАТЕГОРИИ ===
		getCategories: builder.query<NutritionCategory[], void>({
			query: () => '/nutrition/categories',
			providesTags: ['Category'],
		}),

		createCategory: builder.mutation<
			NutritionCategory,
			{ name: string; description?: string }
		>({
			query: (category) => ({
				url: '/nutrition/categories',
				method: 'POST',
				body: category,
			}),
			invalidatesTags: ['Category'],
		}),

		updateCategory: builder.mutation<
			NutritionCategory,
			{ id: string; name?: string; description?: string }
		>({
			query: ({ id, ...updates }) => ({
				url: `/nutrition/categories/${id}`,
				method: 'PUT',
				body: updates,
			}),
			invalidatesTags: ['Category'],
		}),

		deleteCategory: builder.mutation<void, string>({
			query: (id) => ({
				url: `/nutrition/categories/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Category'],
		}),

		// === ПРОГРАММЫ ===
		getSubcategories: builder.query<NutritionSubcategory[], string>({
			query: (categoryId) => `/nutrition/categories/${categoryId}/subcategories`,
			providesTags: ['Subcategory'],
		}),

		createSubcategory: builder.mutation<
			NutritionSubcategory,
			{ categoryId: string; name: string; description?: string }
		>({
			query: ({ categoryId, ...subcategory }) => ({
				url: `/nutrition/categories/${categoryId}/subcategories`,
				method: 'POST',
				body: subcategory,
			}),
			invalidatesTags: ['Subcategory', 'Category'],
		}),

		updateSubcategory: builder.mutation<
			NutritionSubcategory,
			{ id: string; name?: string; description?: string }
		>({
			query: ({ id, ...updates }) => ({
				url: `/nutrition/subcategories/${id}`,
				method: 'PUT',
				body: updates,
			}),
			invalidatesTags: ['Subcategory'],
		}),

		deleteSubcategory: builder.mutation<void, string>({
			query: (id) => ({
				url: `/nutrition/subcategories/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Subcategory', 'Category'],
		}),

		// === ДНИ ===
		getSubcategoryDays: builder.query<NutritionDay[], string>({
			query: (subcategoryId) => `/nutrition/subcategories/${subcategoryId}/days`,
			providesTags: ['Day'],
		}),

		getDay: builder.query<NutritionDay, string>({
			query: (dayId) => `/days/${dayId}`,
			providesTags: ['Day'],
		}),

		createDay: builder.mutation<NutritionDay, Omit<NutritionDay, 'id'>>({
			query: (day) => ({
				url: '/days',
				method: 'POST',
				body: day,
			}),
			invalidatesTags: ['Day'],
		}),

		updateDay: builder.mutation<NutritionDay, NutritionDay>({
			query: (day) => ({
				url: `/days/${day.id}`,
				method: 'PUT',
				body: day,
			}),
			invalidatesTags: ['Day'],
		}),

		deleteDay: builder.mutation<void, string>({
			query: (dayId) => ({
				url: `/days/${dayId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Day'],
		}),

		// === НАЗНАЧЕНИЕ ПЛАНОВ ===
		assignNutritionPlan: builder.mutation<
			AssignedNutritionPlan,
			{
				clientId: string
				subcategoryId: string
				dayIds?: string[]
			}
		>({
			query: ({ clientId, subcategoryId, dayIds }) => ({
				url: `/trainer/clients/${clientId}/nutrition`,
				method: 'POST',
				body: { subcategoryId, dayIds },
			}),
			invalidatesTags: ['AssignedPlan'],
		}),
	}),
})

export const {
	//категории
	useGetCategoriesQuery,
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
	useDeleteCategoryMutation,
	//программы
	useGetSubcategoriesQuery,
	useCreateSubcategoryMutation,
	useUpdateSubcategoryMutation,
	useDeleteSubcategoryMutation,
	//дни
	useGetSubcategoryDaysQuery,
	useGetDayQuery,
	useCreateDayMutation,
	useUpdateDayMutation,
	useDeleteDayMutation,
	// назначение планов
	useAssignNutritionPlanMutation,
	useGetClientNutritionPlanQuery,
} = nutritionApi
