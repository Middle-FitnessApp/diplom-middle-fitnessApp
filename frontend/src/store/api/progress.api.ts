// store/api/progress.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProgressChartData, ProgressComment, ProgressReport } from '../types/progress.types';

// Моковые данные для страниц /me/progress/reports и /me/progress/reports/:id
const mockProgressReports: ProgressReport[] = [
  {
    id: '1',
    userId: '1',
    date: '2024-03-01',
    measurements: {
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
    photos: [
      '/progress/march/front.jpg',
      '/progress/march/side.jpg',
      '/progress/march/back.jpg'
    ],
    notes: 'Хороший прогресс за месяц. Чувствую себя более энергичным, одежда сидит лучше.',
    comments: [
      {
        id: '1',
        progressEntryId: '1',
        trainerId: '2',
        trainerName: 'Петр Тренеров',
        comment: 'Отличные результаты! Видна значительная разница в объемах. Продолжайте соблюдать план питания.',
        createdAt: '2024-03-02T10:00:00Z',
      },
    ],
  },
  {
    id: '2',
    userId: '1',
    date: '2024-02-01',
    measurements: {
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
    photos: [
      '/progress/february/front.jpg',
      '/progress/february/side.jpg'
    ],
    notes: 'Постепенное улучшение. Стараюсь соблюдать режим.',
    comments: [
      {
        id: '2',
        progressEntryId: '2',
        trainerId: '2',
        trainerName: 'Петр Тренеров',
        comment: 'Хорошая динамика. Обратите внимание на потребление воды.',
        createdAt: '2024-02-02T14:30:00Z',
      },
    ],
  },
  {
    id: '3',
    userId: '1',
    date: '2024-01-01',
    measurements: {
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
    photos: [
      '/progress/january/front.jpg',
      '/progress/january/side.jpg',
      '/progress/january/back.jpg'
    ],
    notes: 'Начальные замеры. Есть над чем работать.',
    comments: [
      {
        id: '3',
        progressEntryId: '3',
        trainerId: '2',
        trainerName: 'Петр Тренеров',
        comment: 'Отличные начальные данные! Будем работать по составленному плану.',
        createdAt: '2024-01-02T09:15:00Z',
      },
    ],
  },
];

export const progressApi = createApi({
  reducerPath: 'progressApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/progress',
    fetchFn: async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return fetch(...args);
    },
  }),
  tagTypes: ['Progress', 'ProgressComments'],
  endpoints: (builder) => ({
    // Для страницы /me/progress/reports (AllReports)
    getProgressReports: builder.query<ProgressReport[], string>({
      query: (userId) => `/${userId}/reports`,
      providesTags: ['Progress'],
    }),
    
    // Для страницы /me/progress/reports/:id (Report)
    getProgressReport: builder.query<ProgressReport, string>({
      query: (reportId) => `/reports/${reportId}`,
      providesTags: ['Progress'],
    }),
    
    // Для страницы /me/progress/new-report (AddProgress)
    addProgressReport: builder.mutation<ProgressReport, { 
      userId: string; 
      report: Omit<ProgressReport, 'id' | 'comments'> 
    }>({
      query: ({ userId, report }) => ({
        url: `/${userId}/reports`,
        method: 'POST',
        body: report,
      }),
      invalidatesTags: ['Progress'],
    }),
    
    // Для добавления комментариев к отчетам
    addCommentToProgress: builder.mutation<ProgressComment, { 
      reportId: string; 
      comment: string;
      trainerId: string;
    }>({
      query: ({ reportId, comment, trainerId }) => ({
        url: `/reports/${reportId}/comments`,
        method: 'POST',
        body: { comment, trainerId },
      }),
      invalidatesTags: ['ProgressComments', 'Progress'],
    }),
    
    // Для графиков на странице /me/progress
    getProgressChartData: builder.query<ProgressChartData[], string>({
      query: (userId) => `/${userId}/chart-data`,
      providesTags: ['Progress'],
    }),
  }),
});

export const {
  useGetProgressReportsQuery,
  useGetProgressReportQuery,
  useAddProgressReportMutation,
  useAddCommentToProgressMutation,
  useGetProgressChartDataQuery,
} = progressApi;