// store/api/chat.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
  senderName: string;
  senderAvatar?: string;
}

export interface Chat {
  id: string;
  participant1: string;
  participant2: string;
  messages: Message[];
}

// Моковые данные для страницы /admin/chat/:id
const mockChats: Chat[] = [
  {
    id: '1',
    participant1: '1', // client
    participant2: '2', // trainer
    messages: [
      {
        id: '1',
        senderId: '1',
        receiverId: '2',
        senderName: 'Иван Клиентов',
        senderAvatar: '/avatars/client.jpg',
        message: 'Здравствуйте! У меня вопрос по плану питания на завтрак',
        timestamp: '2024-03-20T10:00:00Z',
        read: true,
      },
      {
        id: '2',
        senderId: '2',
        receiverId: '1',
        senderName: 'Петр Тренеров',
        senderAvatar: '/avatars/trainer.jpg',
        message: 'Здравствуйте, Иван! Слушаю вас, какой вопрос?',
        timestamp: '2024-03-20T10:05:00Z',
        read: true,
      },
      {
        id: '3',
        senderId: '1',
        receiverId: '2',
        senderName: 'Иван Клиентов',
        senderAvatar: '/avatars/client.jpg',
        message: 'Можно ли заменить овсянку на гречку в завтраке?',
        timestamp: '2024-03-20T10:10:00Z',
        read: true,
      },
      {
        id: '4',
        senderId: '2',
        receiverId: '1',
        senderName: 'Петр Тренеров',
        senderAvatar: '/avatars/trainer.jpg',
        message: 'Да, конечно. Гречка тоже отличный вариант. Главное - без масла и соли.',
        timestamp: '2024-03-20T10:15:00Z',
        read: true,
      },
      {
        id: '5',
        senderId: '1',
        receiverId: '2',
        senderName: 'Иван Клиентов',
        senderAvatar: '/avatars/client.jpg',
        message: 'Спасибо! И еще вопрос по тренировке на завтра...',
        timestamp: '2024-03-20T10:20:00Z',
        read: false,
      },
    ],
  },
  {
    id: '2',
    participant1: '3', // client 2
    participant2: '2', // trainer
    messages: [
      {
        id: '6',
        senderId: '3',
        receiverId: '2',
        senderName: 'Мария Клиентова',
        senderAvatar: '/avatars/client2.jpg',
        message: 'Добрый день! Отправила новые замеры',
        timestamp: '2024-03-19T15:30:00Z',
        read: true,
      },
    ],
  },
];

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/chat',
    fetchFn: async (...args) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return fetch(...args);
    },
  }),
  tagTypes: ['Messages'],
  endpoints: (builder) => ({
    // Для страницы /admin/chat/:id
    getMessages: builder.query<Message[], { userId1: string; userId2: string }>({
      query: ({ userId1, userId2 }) => `/${userId1}/${userId2}`,
      providesTags: ['Messages'],
    }),
    
    sendMessage: builder.mutation<Message, { 
      senderId: string; 
      receiverId: string; 
      message: string;
      senderName: string;
      senderAvatar?: string;
    }>({
      query: (messageData) => ({
        url: '/send',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Messages'],
    }),
    
    markMessagesAsRead: builder.mutation<void, { userId: string; contactId: string }>({
      query: ({ userId, contactId }) => ({
        url: '/mark-read',
        method: 'POST',
        body: { userId, contactId },
      }),
      invalidatesTags: ['Messages'],
    }),
    
    // Для списка чатов тренера
    getTrainerChats: builder.query<Chat[], string>({
      query: (trainerId) => `/trainer/${trainerId}/chats`,
      providesTags: ['Messages'],
    }),
  }),
});

export const { 
  useGetMessagesQuery, 
  useSendMessageMutation, 
  useMarkMessagesAsReadMutation,
  useGetTrainerChatsQuery 
} = chatApi;