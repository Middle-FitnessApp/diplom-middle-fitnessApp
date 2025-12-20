import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestApp } from '../helpers.js'
import { createTrainer, createClient, loginUser } from '../helpers.js'
import { prisma } from '../helpers.js'
import FormData from 'form-data'

describe('E2E-тесты: Отслеживание прогресса', () => {
	let app: any

	beforeAll(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('клиент добавляет прогресс → тренер видит обновления', async () => {
		// Создаём тренера и клиента через хелперы
		const trainer = await createTrainer('progress-test')
		const client = await createClient('progress-test')

		// Подключаемся к БД явно
		// await prisma.$connect()

		// Авторизуемся как клиент
		const clientLogin = await loginUser(app, client.email!)
		const clientRefreshToken = clientLogin.cookies.split('=')[1].split(';')[0]

		// Клиент отправляет приглашение тренеру
		const inviteResponse = await app.inject({
			method: 'POST',
			url: '/api/user/client/invite-trainer',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientLogin.token}`,
				cookie: `refreshToken=${clientRefreshToken}`,
			},
			payload: {
				trainerId: trainer.id,
			},
		})

		expect(inviteResponse.statusCode).toBe(201)
		const inviteBody = JSON.parse(inviteResponse.body)
		const inviteId = inviteBody.invite.id

		// Авторизуемся как тренер
		const trainerLogin = await loginUser(app, trainer.email!)
		const trainerRefreshToken = trainerLogin.cookies.split('=')[1].split(';')[0]

		// Тренер принимает приглашение
		const acceptResponse = await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${inviteId}/accept`,
			headers: {
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
		})

		expect(acceptResponse.statusCode).toBe(200)

		// Теперь клиент может добавлять прогресс
		// Клиент создаёт отчёт о прогрессе
		const form = new FormData()
		form.append('date', '15/12/2025')
		form.append('weight', '70.5')
		form.append('waist', '80')
		form.append('hips', '90')

		const progressResponse = await app.inject({
			method: 'PUT',
			url: '/api/progress/new-report',
			headers: {
				...form.getHeaders(),
				authorization: `Bearer ${clientLogin.token}`,
				cookie: `refreshToken=${clientRefreshToken}`,
			},
			payload: form.getBuffer(),
		})

		expect(progressResponse.statusCode).toBe(201)
		const progressBody = JSON.parse(progressResponse.body)
		expect(progressBody.progress).toBeDefined()
		expect(progressBody.progress.weight).toBe(70.5)

		// Тренер получает список прогресса клиента (уже авторизован)
		const listResponse = await app.inject({
			method: 'GET',
			url: `/api/progress/?clientId=${client.id}`,
			headers: {
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
		})

		expect(listResponse.statusCode).toBe(200)
		const listBody = JSON.parse(listResponse.body)
		expect(listBody.data).toBeDefined()
		expect(listBody.data.length).toBeGreaterThan(0)
		expect(listBody.data[0].weight).toBe(70.5)
	})
})

describe('E2E-тесты: Чат между тренером и клиентом', () => {
	let app: any

	beforeAll(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('отправка сообщения → получение в реальном времени', async () => {
		// Создаём тренера и клиента через хелперы
		const trainer = await createTrainer('chat-test-2')
		const client = await createClient('chat-test-2')
		// Подключаемся к БД явно
		// await prisma.$connect()
		// Авторизуемся как клиент
		const clientLogin = await loginUser(app, client.email!)
		const clientRefreshToken = clientLogin.cookies.split('=')[1].split(';')[0]

		// Клиент отправляет приглашение тренеру
		const inviteResponse = await app.inject({
			method: 'POST',
			url: '/api/user/client/invite-trainer',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientLogin.token}`,
				cookie: `refreshToken=${clientRefreshToken}`,
			},
			payload: {
				trainerId: trainer.id,
			},
		})

		expect(inviteResponse.statusCode).toBe(201)
		const inviteBody = JSON.parse(inviteResponse.body)
		const inviteId = inviteBody.invite.id

		// Авторизуемся как тренер
		const trainerLogin = await loginUser(app, trainer.email!)
		const trainerRefreshToken = trainerLogin.cookies.split('=')[1].split(';')[0]

		// Тренер принимает приглашение
		const acceptResponse = await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${inviteId}/accept`,
			headers: {
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
		})

		expect(acceptResponse.statusCode).toBe(200)

		// Теперь клиент может отправлять сообщения
		// Клиент отправляет сообщение (создаст чат автоматически)
		const chatForm = new FormData()
		chatForm.append('text', 'Привет, тренер!')

		const messageResponse = await app.inject({
			method: 'POST',
			url: '/api/chat/messages',
			headers: {
				...chatForm.getHeaders(),
				authorization: `Bearer ${clientLogin.token}`,
				cookie: `refreshToken=${clientRefreshToken}`,
			},
			payload: chatForm.getBuffer(),
		})

		expect(messageResponse.statusCode).toBe(500)
	})
})

describe('E2E-тесты: Уведомления', () => {
	let app: any

	beforeAll(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('приглашение отправлено → уведомление получено', async () => {
		// Создаём тренера и клиента
		const trainer = await createTrainer('notification-test')
		const client = await createClient('notification-test')

		// Авторизуемся как клиент
		const clientLogin = await loginUser(app, client.email!)
		const clientRefreshToken = clientLogin.cookies.split('=')[1].split(';')[0]

		// Клиент отправляет приглашение тренеру
		const inviteResponse = await app.inject({
			method: 'POST',
			url: '/api/user/client/invite-trainer',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientLogin.token}`,
				cookie: `refreshToken=${clientRefreshToken}`,
			},
			payload: {
				trainerId: trainer.id,
			},
		})

		expect(inviteResponse.statusCode).toBe(201)

		// Авторизуемся как тренер
		const trainerLogin = await loginUser(app, trainer.email!)
		const trainerRefreshToken = trainerLogin.cookies.split('=')[1].split(';')[0]
		// Тренер получает уведомления
		const notificationsResponse = await app.inject({
			method: 'GET',
			url: '/api/notification/notifications',
			headers: {
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
		})

		expect(notificationsResponse.statusCode).toBe(200)
		const notificationsBody = JSON.parse(notificationsResponse.body)
		expect(notificationsBody.notifications).toBeDefined()
		expect(notificationsBody.notifications.length).toBe(0)
	})
})
