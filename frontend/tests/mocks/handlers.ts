import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:3000/api'

// Моковые данные
const mockUser = {
	id: 'user-1',
	name: 'Иван Иванов',
	email: 'ivan@example.com',
	phone: '+79991234567',
	role: 'CLIENT',
	age: 25,
	photo: '/uploads/default/user.png',
}

const mockClients = [
	{
		id: 'client-1',
		name: 'Анна Смирнова',
		email: 'anna@example.com',
		age: 28,
		avatarUrl: '/uploads/clients/anna.jpg',
		isFavorite: true,
		hasNewReport: false,
	},
	{
		id: 'client-2',
		name: 'Дмитрий Соколов',
		email: 'dmitry@example.com',
		age: 32,
		avatarUrl: '/uploads/clients/dmitry.jpg',
		isFavorite: false,
		hasNewReport: true,
	},
]

const mockMessages = [
	{
		id: 'msg-1',
		chatId: 'chat-1',
		senderId: 'user-1',
		text: 'Привет!',
		createdAt: new Date().toISOString(),
		isRead: true,
		sender: { id: 'user-1', name: 'Иван', photo: null },
	},
	{
		id: 'msg-2',
		chatId: 'chat-1',
		senderId: 'trainer-1',
		text: 'Здравствуйте!',
		createdAt: new Date().toISOString(),
		isRead: false,
		sender: { id: 'trainer-1', name: 'Пётр', photo: null },
	},
]

export const handlers = [
	// Auth
	http.get(`${API_URL}/user/me`, () => {
		return HttpResponse.json({ user: mockUser })
	}),

	// Clients
	http.get(`${API_URL}/trainer/clients`, () => {
		return HttpResponse.json(mockClients)
	}),

	http.post(`${API_URL}/progress`, () => {
		return HttpResponse.json({ success: true })
	}),

	// Invites
	http.get(`${API_URL}/trainer/invites`, () => {
		return HttpResponse.json({
			invites: [
				{
					id: 'invite-1',
					clientId: 'client-3',
					trainerId: 'trainer-1',
					status: 'PENDING',
					client: {
						id: 'client-3',
						name: 'Мария Кузнецова',
						photo: null,
					},
				},
			],
		})
	}),

	http.put(`${API_URL}/trainer/invites/:inviteId/accept`, () => {
		return HttpResponse.json({ message: 'Приглашение принято' })
	}),

	http.put(`${API_URL}/trainer/invites/:inviteId/reject`, () => {
		return HttpResponse.json({ message: 'Приглашение отклонено' })
	}),

	// Stats
	http.get(`${API_URL}/trainer/stats`, () => {
		return HttpResponse.json({
			acceptedClients: 2,
			favoriteClients: 1,
			pendingInvites: 1,
			nutritionPlans: 0,
		})
	}),

	// Chat
	http.get(`${API_URL}/chat/messages`, () => {
		return HttpResponse.json({ messages: mockMessages })
	}),

	http.post(`${API_URL}/chat/messages`, async ({ request }) => {
		const formData = await request.formData()
		const text = formData.get('text')

		return HttpResponse.json({
			message: {
				id: `msg-${Date.now()}`,
				chatId: 'chat-1',
				senderId: 'user-1',
				text: text || '',
				createdAt: new Date().toISOString(),
				isRead: false,
				sender: { id: 'user-1', name: 'Иван', photo: null },
			},
		})
	}),

	http.get(`${API_URL}/chat/chats`, () => {
		return HttpResponse.json({
			chats: [
				{
					id: 'chat-1',
					clientId: 'user-1',
					trainerId: 'trainer-1',
					unreadCount: 0,
				},
			],
		})
	}),

	// Progress
	http.post(`${API_URL}/progress/new-report`, async ({ request }) => {
		const formData = await request.formData()

		return HttpResponse.json({
			message: 'Прогресс добавлен',
			report: {
				id: 'report-1',
				userId: 'user-1',
				date: formData.get('date'),
				weight: formData.get('weight'),
				waist: formData.get('waist'),
				hips: formData.get('hips'),
			},
		})
	}),

	// Error handlers для тестирования ошибок
	http.post(`${API_URL}/progress/error`, () => {
		return HttpResponse.json({ message: 'Validation error' }, { status: 400 })
	}),

	http.get(`${API_URL}/auth/unauthorized`, () => {
		return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
	}),

	http.get(`${API_URL}/not-found`, () => {
		return HttpResponse.json({ message: 'Not found' }, { status: 404 })
	}),
]
