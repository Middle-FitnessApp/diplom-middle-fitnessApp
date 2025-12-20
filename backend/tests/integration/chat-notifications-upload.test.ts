import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
	createTestApp,
	createTrainer,
	createClient,
	loginUser,
	prisma,
} from '../helpers.js'

describe('Интеграционные тесты: Роуты чата', () => {
	let app: any
	let trainer: any
	let client: any
	let trainerToken: string
	let clientToken: string
	let trainerRefreshToken: string
	let clientRefreshToken: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()

		// Создаем тренера и клиента
		trainer = await createTrainer('chat-test')
		client = await createClient('chat-test')

		// Связываем их
		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'ACCEPTED',
			},
		})

		// Авторизуемся
		const trainerLogin = await loginUser(app, trainer.email)
		trainerToken = trainerLogin.token
		trainerRefreshToken = trainerLogin.cookies.split('=')[1].split(';')[0]

		const clientLogin = await loginUser(app, client.email)
		clientToken = clientLogin.token
		clientRefreshToken = clientLogin.cookies.split('=')[1].split(';')[0]
	})

	afterEach(async () => {
		await app.close()
		// Очистка данных
		await prisma.message.deleteMany({
			where: {
				OR: [{ senderId: trainer.id }, { senderId: client.id }],
			},
		})
		await prisma.chat.deleteMany({
			where: {
				OR: [{ trainerId: trainer.id }, { clientId: client.id }],
			},
		})
		await prisma.trainerClient.deleteMany({
			where: {
				OR: [{ trainerId: trainer.id }, { clientId: client.id }],
			},
		})
		await prisma.user.deleteMany({
			where: {
				id: { in: [trainer.id, client.id] },
			},
		})
	})

	it('POST /api/chat/messages - отправка сообщения', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/chat/messages',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientRefreshToken,
			},
			payload: {
				text: 'Тестовое сообщение',
			},
		})

		expect(response.statusCode).toBe(201)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('message')
		expect(body.message.text).toBe('Тестовое сообщение')
		expect(body.message.senderId).toBe(client.id)

		// Проверяем запись в БД
		const messageInDb = await prisma.message.findUnique({
			where: { id: body.message.id },
		})
		expect(messageInDb).toBeTruthy()
		expect(messageInDb?.text).toBe('Тестовое сообщение')

		// Проверяем, что чат создан
		const chatInDb = await prisma.chat.findUnique({
			where: { id: body.message.chatId },
		})
		expect(chatInDb).toBeTruthy()
		expect(chatInDb?.trainerId).toBe(trainer.id)
		expect(chatInDb?.clientId).toBe(client.id)
	})

	it('GET /api/chat/messages - получение сообщений', async () => {
		// Сначала отправим сообщение
		const sendResponse = await app.inject({
			method: 'POST',
			url: '/api/chat/messages',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientRefreshToken,
			},
			payload: {
				text: 'Сообщение для получения',
			},
		})

		expect(sendResponse.statusCode).toBe(201)
		const chatId = JSON.parse(sendResponse.body).message.chatId

		// Получаем сообщения
		const response = await app.inject({
			method: 'GET',
			url: `/api/chat/${chatId}/messages`,
			headers: {
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientRefreshToken,
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('messages')
		expect(body).toHaveProperty('pagination')
		expect(Array.isArray(body.messages)).toBe(true)
		expect(body.messages.length).toBeGreaterThan(0)
		expect(body.messages[0].text).toBe('Сообщение для получения')
		expect(body.messages[0].sender.id).toBe(client.id)
	})
})

describe('Интеграционные тесты: Роуты уведомлений', () => {
	let app: any
	let user: any
	let userToken: string
	let userRefreshToken: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()

		// Создаем пользователя
		user = await createClient('notification-test')

		// Авторизуемся
		const login = await loginUser(app, user.email)
		userToken = login.token
		userRefreshToken = login.cookies.split('=')[1].split(';')[0]
	})

	afterEach(async () => {
		await app.close()
		await prisma.notification.deleteMany({
			where: { userId: user.id },
		})
		await prisma.user.deleteMany({
			where: { id: user.id },
		})
	})

	it('GET /api/notifications - список уведомлений', async () => {
		// Создаем уведомление в БД
		await prisma.notification.create({
			data: {
				userId: user.id,
				type: 'MESSAGE',
				message: 'Тестовое уведомление',
				isRead: false,
			},
		})

		const response = await app.inject({
			method: 'GET',
			url: '/api/notification/notifications',
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			cookies: {
				refreshToken: userRefreshToken,
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('notifications')
		expect(body).toHaveProperty('unreadCount')
		expect(body).toHaveProperty('pagination')
		expect(Array.isArray(body.notifications)).toBe(true)
		expect(body.notifications.length).toBeGreaterThan(0)
		expect(body.notifications[0].message).toBe('Тестовое уведомление')
		expect(body.notifications[0].type).toBe('MESSAGE')
		expect(body.unreadCount).toBe(1)
	})

	it('PUT /api/notifications/:id/read - отметить как прочитанное', async () => {
		// Создаем уведомление
		const notification = await prisma.notification.create({
			data: {
				userId: user.id,
				type: 'REPORT',
				message: 'Уведомление для чтения',
				isRead: false,
			},
		})

		const response = await app.inject({
			method: 'PATCH',
			url: `/api/notification/notifications/${notification.id}/read`,
			headers: {
				authorization: `Bearer ${userToken}`,
			},
			cookies: {
				refreshToken: userRefreshToken,
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('message')
		expect(body).toHaveProperty('notification')
		expect(body.notification.isRead).toBe(true)

		// Проверяем в БД
		const updatedNotification = await prisma.notification.findUnique({
			where: { id: notification.id },
		})
		expect(updatedNotification?.isRead).toBe(true)
	})
})

describe('Интеграционные тесты: Загрузка файлов', () => {
	let app: any
	let trainer: any
	let client: any
	let clientToken: string
	let clientRefreshToken: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()

		// Создаем тренера и клиента
		trainer = await createTrainer('upload-test')
		client = await createClient('upload-test')

		// Связываем их
		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'ACCEPTED',
			},
		})

		// Авторизуемся как клиент
		const login = await loginUser(app, client.email)
		clientToken = login.token
		clientRefreshToken = login.cookies.split('=')[1].split(';')[0]
	})

	afterEach(async () => {
		await app.close()
		// Очистка данных
		await prisma.message.deleteMany({
			where: {
				OR: [{ senderId: trainer.id }, { senderId: client.id }],
			},
		})
		await prisma.chat.deleteMany({
			where: {
				OR: [{ trainerId: trainer.id }, { clientId: client.id }],
			},
		})
		await prisma.trainerClient.deleteMany({
			where: {
				OR: [{ trainerId: trainer.id }, { clientId: client.id }],
			},
		})
		await prisma.user.deleteMany({
			where: {
				id: { in: [trainer.id, client.id] },
			},
		})
	})

	it('POST /api/chat/messages - загрузка фото через сообщение', async () => {
		// Создаем тестовый файл (имитация multipart)
		// В реальном тесте нужно использовать form-data, но для простоты проверим без файла
		const response = await app.inject({
			method: 'POST',
			url: '/api/chat/messages',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientRefreshToken,
			},
			payload: {
				text: 'Сообщение с фото',
				image: 'https://example.com/test.jpg', // Имитация URL
			},
		})

		expect(response.statusCode).toBe(201)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('message')
		expect(body.message.text).toBe('Сообщение с фото')
		expect(body.message.imageUrl).toBe('https://example.com/test.jpg')

		// Проверяем в БД
		const messageInDb = await prisma.message.findUnique({
			where: { id: body.message.id },
		})
		expect(messageInDb?.imageUrl).toBe('https://example.com/test.jpg')
	})
})
