// store/api/nutrition.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AssignedNutritionPlan, NutritionPlan } from '../types/nutrition.types';

// Моковые данные для страницы /me/nutrition
const mockNutritionPlans: NutritionPlan[] = [
  {
    id: '1',
    trainerId: '2',
    name: 'План для похудения',
    description: 'Сбалансированное питание для постепенного снижения веса с сохранением мышечной массы',
    goal: 'weight_loss',
    dailyCalories: 1800,
    meals: [
      {
        id: '1',
        name: 'Завтрак',
        description: 'Овсянка на воде с ягодами и орехами, 1 вареное яйцо',
        calories: 400,
        protein: 20,
        carbs: 55,
        fat: 12,
        time: '08:00',
      },
      {
        id: '2',
        name: 'Перекус',
        description: 'Яблоко, горсть миндаля',
        calories: 200,
        protein: 5,
        carbs: 25,
        fat: 10,
        time: '11:00',
      },
      {
        id: '3',
        name: 'Обед',
        description: 'Куриная грудка с гречкой и тушеными овощами',
        calories: 500,
        protein: 35,
        carbs: 45,
        fat: 15,
        time: '14:00',
      },
      {
        id: '4',
        name: 'Перекус',
        description: 'Творог с йогуртом',
        calories: 250,
        protein: 25,
        carbs: 15,
        fat: 8,
        time: '17:00',
      },
      {
        id: '5',
        name: 'Ужин',
        description: 'Рыба на пару с салатом из свежих овощей',
        calories: 350,
        protein: 30,
        carbs: 20,
        fat: 15,
        time: '19:00',
      },
    ],
    created_at: '2024-01-15',
  },
  {
    id: '2',
    trainerId: '2',
    name: 'План для набора массы',
    description: 'Высококалорийное питание для набора мышечной массы',
    goal: 'muscle_gain',
    dailyCalories: 3000,
    meals: [
      {
        id: '6',
        name: 'Завтрак',
        description: 'Омлет из 3 яиц, тосты с авокадо, протеиновый коктейль',
        calories: 600,
        protein: 40,
        carbs: 45,
        fat: 25,
        time: '08:00',
      },
      // ... другие приемы пищи
    ],
    created_at: '2024-02-01',
  },
];

// Для страницы /me/nutrition
const mockAssignedPlans: AssignedNutritionPlan[] = [
  {
    id: '1',
    clientId: '1',
    planId: '1',
    startDate: '2024-03-01',
    endDate: '2024-06-01',
    plan: mockNutritionPlans[0],
  },
];

// Для страниц тренера /admin/nutrition
const mockTrainerPlans = mockNutritionPlans.filter(plan => plan.trainerId === '2');

export const nutritionApi = createApi({
  reducerPath: 'nutritionApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/nutrition',
    fetchFn: async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 700));
      return fetch(...args);
    },
  }),
  tagTypes: ['NutritionPlan', 'AssignedNutritionPlan'],
  endpoints: (builder) => ({
    // Для страницы /me/nutrition (клиент)
    getAssignedNutritionPlan: builder.query<AssignedNutritionPlan, string>({
      query: (userId) => `/${userId}/plan`,
      providesTags: ['AssignedNutritionPlan'],
    }),
    
    // Для страницы /admin/nutrition (тренер - список планов)
    getNutritionPlans: builder.query<NutritionPlan[], string>({
      query: (trainerId) => `/trainer/${trainerId}/plans`,
      providesTags: ['NutritionPlan'],
    }),
    
    // Для страницы /admin/nutrition/:category/:subcategory (просмотр плана)
    getNutritionPlan: builder.query<NutritionPlan, string>({
      query: (planId) => `/plans/${planId}`,
      providesTags: ['NutritionPlan'],
    }),
    
    // Для страницы /admin/nutrition/:category/create (создание плана)
    createNutritionPlan: builder.mutation<NutritionPlan, Omit<NutritionPlan, 'id'>>({
      query: (plan) => ({
        url: '/plans',
        method: 'POST',
        body: plan,
      }),
      invalidatesTags: ['NutritionPlan'],
    }),
    
    // Для страницы /admin/client/:id/add-nutrition (назначение плана клиенту)
    assignNutritionPlan: builder.mutation<void, { 
      clientId: string; 
      planId: string; 
      startDate: string; 
      endDate?: string 
    }>({
      query: ({ clientId, planId, startDate, endDate }) => ({
        url: `/${clientId}/assign`,
        method: 'POST',
        body: { planId, startDate, endDate },
      }),
      invalidatesTags: ['AssignedNutritionPlan'],
    }),
    
    // Для обновления плана питания
    updateNutritionPlan: builder.mutation<NutritionPlan, { 
      planId: string; 
      plan: Partial<NutritionPlan> 
    }>({
      query: ({ planId, plan }) => ({
        url: `/plans/${planId}`,
        method: 'PUT',
        body: plan,
      }),
      invalidatesTags: ['NutritionPlan'],
    }),
    
    // Для удаления плана питания
    deleteNutritionPlan: builder.mutation<void, string>({
      query: (planId) => ({
        url: `/plans/${planId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NutritionPlan'],
    }),
  }),
});

export const {
  useGetAssignedNutritionPlanQuery,
  useGetNutritionPlansQuery,
  useGetNutritionPlanQuery,
  useCreateNutritionPlanMutation,
  useAssignNutritionPlanMutation,
  useUpdateNutritionPlanMutation,
  useDeleteNutritionPlanMutation,
} = nutritionApi;