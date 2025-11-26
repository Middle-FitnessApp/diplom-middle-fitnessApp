// store/api/user.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BodyMeasurement, ProgressEntry, UserProfile } from '../types/user.types';

// Моковые профили для страницы /me
const mockProfiles: UserProfile[] = [
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
    goal: 'Похудение и укрепление мышц',
    expectedResult: 'Сбросить 10 кг за 3 месяца, улучшить физическую форму',
    contraindications: 'Проблемы с коленными суставами',
    diseases: 'Нет хронических заболеваний',
    experience: 'beginner',
    currentDiet: 'Обычное питание с перекусами',
    photos: [
      '/photos/client/front.jpg',
      '/photos/client/side.jpg', 
      '/photos/client/back.jpg'
    ],
  },
];

// Моковые данные для страниц /me/progress и /me/progress/reports
const mockBodyMeasurements: BodyMeasurement[] = [
  {
    id: '1',
    userId: '1',
    date: '2024-01-01',
    weight: 80,
    waistCircumference: 90,
    chestCircumference: 100,
    hipCircumference: 105,
    armCircumference: 36,
    legCircumference: 58,
  },
  {
    id: '2',
    userId: '1',
    date: '2024-02-01',
    weight: 78,
    waistCircumference: 88,
    chestCircumference: 98,
    hipCircumference: 103,
    armCircumference: 35.5,
    legCircumference: 57,
  },
  {
    id: '3',
    userId: '1',
    date: '2024-03-01',
    weight: 75,
    waistCircumference: 85,
    chestCircumference: 95,
    hipCircumference: 100,
    armCircumference: 35,
    legCircumference: 55,
  },
];

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/users',
    fetchFn: async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return fetch(...args);
    },
  }),
  tagTypes: ['User', 'BodyMeasurements', 'Progress'],
  endpoints: (builder) => ({
    // Для страницы /me (личный кабинет)
    getProfile: builder.query<UserProfile, string>({
      query: (userId) => `/${userId}/profile`,
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation<UserProfile, { userId: string; profile: Partial<UserProfile> }>({
      query: ({ userId, profile }) => ({
        url: `/${userId}/profile`,
        method: 'PUT',
        body: profile,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Для страницы /me/progress
    getBodyMeasurements: builder.query<BodyMeasurement[], string>({
      query: (userId) => `/${userId}/body-measurements`,
      providesTags: ['BodyMeasurements'],
    }),
    
    // Для страницы /me/progress/new-report
    addBodyMeasurement: builder.mutation<BodyMeasurement, { userId: string; measurement: Omit<BodyMeasurement, 'id'> }>({
      query: ({ userId, measurement }) => ({
        url: `/${userId}/body-measurements`,
        method: 'POST',
        body: measurement,
      }),
      invalidatesTags: ['BodyMeasurements', 'Progress'],
    }),
    
    // Для страницы /me/progress/reports
    getProgressHistory: builder.query<ProgressEntry[], string>({
      query: (userId) => `/${userId}/progress`,
      providesTags: ['Progress'],
    }),
    
    // Для загрузки аватара на странице /me
    uploadAvatar: builder.mutation<{ avatarUrl: string }, { userId: string; file: FormData }>({
      query: ({ userId, file }) => ({
        url: `/${userId}/avatar`,
        method: 'POST',
        body: file,
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

// Моковые реализации для разработки
const mockApi = {
  getProfile: (userId: string) => 
    mockProfiles.find(p => p.userId === userId) || mockProfiles[0],
  
  getBodyMeasurements: (userId: string) =>
    mockBodyMeasurements.filter(m => m.userId === userId),
  
  addBodyMeasurement: (userId: string, measurement: Omit<BodyMeasurement, 'id'>) => {
    const newMeasurement = {
      ...measurement,
      id: (mockBodyMeasurements.length + 1).toString(),
    };
    mockBodyMeasurements.push(newMeasurement);
    return newMeasurement;
  },
};

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetBodyMeasurementsQuery,
  useAddBodyMeasurementMutation,
  useGetProgressHistoryQuery,
  useUploadAvatarMutation,
} = userApi;