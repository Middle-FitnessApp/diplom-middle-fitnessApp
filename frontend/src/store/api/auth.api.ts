// store/api/auth.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth.types';

// Моковые данные пользователей
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'client@example.com',
    password: 'password123',
    name: 'Иван Клиентов',
    role: 'client',
    phone: '+79991234567',
    avatar: '/avatars/client.jpg',
  },
  {
    id: '2', 
    email: 'trainer@example.com',
    password: 'password123',
    name: 'Петр Тренеров',
    role: 'trainer',
    phone: '+79991234568',
    telegram: '@trainer_petr',
    whatsapp: '+79991234568',
    avatar: '/avatars/trainer.jpg',
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: 'password123',
    name: 'Админ Админов',
    role: 'admin',
    phone: '+79991234569',
    avatar: '/avatars/admin.jpg',
  },
];

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    fetchFn: async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return fetch(...args);
    },
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => {
        const user = mockUsers.find(u => 
          u.email === credentials.email && u.password === credentials.password
        );
        
        if (!user) {
          throw new Error('Неверный email или пароль');
        }
        
        const { password, ...userWithoutPassword } = user;
        return {
          url: '/login',
          method: 'POST',
          body: {
            user: userWithoutPassword,
            token: `mock-jwt-token-${user.id}`,
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),
    
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => {
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('Пользователь с таким email уже существует');
        }
        
        const newUser = {
          id: (mockUsers.length + 1).toString(),
          ...userData,
          avatar: '/avatars/default.jpg',
        };
        
        return {
          url: '/register',
          method: 'POST',
          body: {
            user: newUser,
            token: `mock-jwt-token-${newUser.id}`,
          },
        };
      },
      invalidatesTags: ['Auth'],
    }),
    
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    
    // Для страницы /me (личный кабинет)
    getCurrentUser: builder.query<User, void>({
      query: () => '/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation,
  useGetCurrentUserQuery 
} = authApi;