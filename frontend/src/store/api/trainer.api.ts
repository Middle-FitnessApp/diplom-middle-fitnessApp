import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { UserProfile } from '../types/user.types'
import type { ProgressReport } from '../types/progress.types'
import type { AuthUser } from '../types/auth.types'

export const trainerApi = createApi({
  reducerPath: 'trainerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api/trainer',
    credentials: 'include', 
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token') 
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Clients', 'Client'],
  endpoints: (builder) => ({
    
    getClients: builder.query<AuthUser[], void>({
      query: () => '/clients',
      // бэк возвращает { clients: [...] }
      transformResponse: (resp: { clients: AuthUser[] }) => resp.clients,
      providesTags: ['Clients'],
    }),

   
    toggleClientStar: builder.mutation<
      { starred: boolean },
      { clientId: string }
    >({
      query: ({ clientId }) => ({
        url: `/clients/${clientId}/star`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Clients'],
    }),
	
    // Для страницы /admin/client/:id (профиль клиента)
    getClientProfile: builder.query<UserProfile, { trainerId: string; clientId: string }>({
      query: ({ trainerId, clientId }) => `/${trainerId}/clients/${clientId}/profile`,
      providesTags: ['Client'],
    }),

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
