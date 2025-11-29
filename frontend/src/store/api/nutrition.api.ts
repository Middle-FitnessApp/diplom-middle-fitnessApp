import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
	NutritionCategory,
	NutritionProgram,
	ProgramDay,
	AssignedNutritionPlan,
} from '../types/nutrition.types'

export const nutritionApi = createApi({
	reducerPath: 'nutritionApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api/nutrition',
	}),
	tagTypes: ['Category', 'Program', 'Day', 'AssignedPlan'],
	endpoints: (builder) => ({
		// == КАТЕГОРИИ === (для NutritionTrainer)
		getCategories: builder.query<NutritionCategory[], void>({
			query: () => '/categories',
			providesTags: ['Category'],
		}),

		getCategory: builder.query<NutritionCategory, string>({
			query: (categoryId) => `/categories/${categoryId}`,
			providesTags: ['Category'],
		}),

		createCategory: builder.mutation<NutritionCategory, Omit<NutritionCategory, 'id'>>({
			query: (category) => ({
				url: '/categories',
				method: 'POST',
				body: category,
			}),
			invalidatesTags: ['Category'],
		}),

		// = ПРОГРАММЫ = (для CreateNutritionTraier)
		getPrograms: builder.query<NutritionProgram[], string>({
			query: (categoryId) => `/categories/${categoryId}/programs`,
			providesTags: ['Program'],
		}),

		getProgram: builder.query<NutritionProgram, string>({
			query: (programId) => `/programs/${programId}`,
			providesTags: ['Program'],
		}),

		createProgram: builder.mutation<NutritionProgram, Omit<NutritionProgram, 'id'>>({
			query: (program) => ({
				url: '/programs',
				method: 'POST',
				body: program,
			}),
			invalidatesTags: ['Program'],
		}),

		updateProgram: builder.mutation<NutritionProgram, NutritionProgram>({
			query: (program) => ({
				url: `/programs/${program.id}`,
				method: 'PUT',
				body: program,
			}),
			invalidatesTags: ['Program'],
		}),

		deleteProgram: builder.mutation<void, string>({
			query: (programId) => ({
				url: `/programs/${programId}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Program'],
		}),

		// === ДНИ (для NutritionPlanTrainer и CrateNutritionTrainer)
		getProgramDays: builder.query<ProgramDay[], string>({
			query: (programId) => `/programs/${programId}/days`,
			providesTags: ['Day'],
		}),

		getDay: builder.query<ProgramDay, string>({
			query: (dayId) => `/days/${dayId}`,
			providesTags: ['Day'],
		}),

		createDay: builder.mutation<ProgramDay, Omit<ProgramDay, 'id'>>({
			query: (day) => ({
				url: '/days',
				method: 'POST',
				body: day,
			}),
			invalidatesTags: ['Day'],
		}),

		updateDay: builder.mutation<ProgramDay, ProgramDay>({
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

		// === НАЗНАЧЕНИЕ ПЛАНОВ  (для AddNutritionTrainer)
		assignNutritionPlan: builder.mutation<
			AssignedNutritionPlan,
			{
				clientId: string
				programId: string
				dayIds: string[]
			}
		>({
			query: (assignment) => ({
				url: `/clients/${assignment.clientId}/assign`,
				method: 'POST',
				body: assignment,
			}),
			invalidatesTags: ['AssignedPlan'],
		}),
	}),
})

export const {
	// Категории
	useGetCategoriesQuery,
	useGetCategoryQuery,
	useCreateCategoryMutation,

	// Программы
	useGetProgramsQuery,
	useGetProgramQuery,
	useCreateProgramMutation,
	useUpdateProgramMutation,
	useDeleteProgramMutation,

	// Дни
	useGetProgramDaysQuery,
	useGetDayQuery,
	useCreateDayMutation,
	useUpdateDayMutation,
	useDeleteDayMutation,

	// Назначение программы
	useAssignNutritionPlanMutation,
} = nutritionApi
