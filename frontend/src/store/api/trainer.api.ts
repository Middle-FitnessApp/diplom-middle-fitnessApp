// store/api/trainer.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { User } from '../types/auth.types';
import type { UserProfile } from '../types/user.types';
import type { ProgressReport } from '../types/progress.types';


// Моковые данные для страницы /admin (тренер)
const mockClients: User[] = [
  {
    id: '1',
    email: 'client@example.com',
    name: 'Иван Клиентов',
    role: 'client',
    phone: '+79991234567',
    avatar: '/avatars/client.jpg',
  },
  {
    id: '3',
    email: 'client2@example.com',
    name: 'Мария Клиентова',
    role: 'client',
    phone: '+79991234568',
    avatar: '/avatars/client2.jpg',
  },
  {
    id: '4',
    email: 'client3@example.com',
    name: 'Алексей Подопечный',
    role: 'client',
    phone: '+79991234569',
    avatar: '/avatars/client3.jpg',
  },
];

// Для страницы /admin/client/:id (профиль клиента)
const mockClientProfiles: UserProfile[] = [
  {
    id: '1',
    userId: '1',
    age: 25,
    weight: 75,
    height: 180,
    waistCircumference: 85,
    chestCircumference: 95,
    hipCircumference: 100,
    armCircumference: 35,
    legCircumference: 55,
    goal: 'Похудение',
    expectedResult: 'Сбросить 10 кг за 3 месяца',
    contraindications: 'Проблемы с коленями',
    diseases: 'Нет',
    experience: 'beginner',
    currentDiet: 'Обычное питание',
    photos: ['/photos/client1/front.jpg', '/photos/client1/side.jpg', '/photos/client1/back.jpg'],
  },
  {
    id: '2',
    userId: '3',
    age: 30,
    weight: 65,
    height: 165,
    waistCircumference: 70,
    chestCircumference: 90,
    hipCircumference: 95,
    armCircumference: 30,
    legCircumference: 50,
    goal: 'Поддержание формы',
    expectedResult: 'Улучшить тонус мышц',
    contraindications: 'Нет',
    diseases: 'Нет',
    experience: 'intermediate',
    currentDiet: 'Здоровое питание',
    photos: ['/photos/client2/front.jpg', '/photos/client2/side.jpg', '/photos/client2/back.jpg'],
  },
];

export const trainerApi = createApi({
  reducerPath: 'trainerApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/trainer',
    fetchFn: async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return fetch(...args);
    },
  }),
  tagTypes: ['Clients', 'Client'],
  endpoints: (builder) => ({
    // Для страницы /admin (список клиентов тренера)
    getClients: builder.query<User[], string>({
      query: (trainerId) => `/${trainerId}/clients`,
      providesTags: ['Clients'],
    }),
    
    // Для страницы /admin/client/:id (профиль клиента)
    getClientProfile: builder.query<UserProfile, { trainerId: string; clientId: string }>({
      query: ({ trainerId, clientId }) => `/${trainerId}/clients/${clientId}/profile`,
      providesTags: ['Client'],
    }),
    
    // Для страницы /admin/client/:id (прогресс клиента)
    getClientProgress: builder.query<ProgressReport[], { trainerId: string; clientId: string }>({
      query: ({ trainerId, clientId }) => `/${trainerId}/clients/${clientId}/progress`,
      providesTags: ['Client'],
    }),
    
    // Для обновления профиля клиента тренером
    updateClientProfile: builder.mutation<UserProfile, { 
      trainerId: string; 
      clientId: string; 
      profile: Partial<UserProfile> 
    }>({
      query: ({ trainerId, clientId, profile }) => ({
        url: `/${trainerId}/clients/${clientId}/profile`,
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['Client'],
    }),
    
    // Для добавления комментария к прогрессу клиента
    addCommentToClientProgress: builder.mutation<void, {
      trainerId: string;
      clientId: string;
      progressId: string;
      comment: string;
    }>({
      query: ({ trainerId, clientId, progressId, comment }) => ({
        url: `/${trainerId}/clients/${clientId}/progress/${progressId}/comment`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: ['Client'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientProfileQuery,
  useGetClientProgressQuery,
  useUpdateClientProfileMutation,
  useAddCommentToClientProgressMutation,
} = trainerApi;