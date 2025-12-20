import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { createTestApp } from '../helpers.js'
import { createTrainer, createClient, loginUser } from '../helpers.js'
import { prisma } from '../helpers.js'

describe('E2E-тесты: Полный цикл аутентификации', () => {
	let app: any

	beforeAll(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('регистрация → логин → доступ к защищённому роуту', async () => {
		// Создаём тренера через хелперы для скорости
		const trainer = await createTrainer('auth-test')

		// Логин через API
		const loginResponse = await app.inject({
			method: 'POST',
			url: '/api/auth/login',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				emailOrPhone: trainer.email!,
				password: 'Test123!@#',
			},
		})

		expect(loginResponse.statusCode).toBe(200)
		const loginBody = JSON.parse(loginResponse.body)
		expect(loginBody.user).toBeDefined()
		expect(loginBody.token.accessToken).toBeDefined()

		const accessToken = loginBody.token.accessToken
		const setCookieHeader = loginResponse.headers['set-cookie']

		let refreshToken = ''
		if (Array.isArray(setCookieHeader)) {
			const refreshCookie = setCookieHeader.find((c) => c.startsWith('refreshToken='))
			if (refreshCookie) {
				refreshToken = refreshCookie.split('=')[1].split(';')[0]
			}
		} else if (typeof setCookieHeader === 'string') {
			if (setCookieHeader.startsWith('refreshToken=')) {
				refreshToken = setCookieHeader.split('=')[1].split(';')[0]
			}
		}

		// Доступ к защищённому роуту
		const profileResponse = await app.inject({
			method: 'GET',
			url: '/api/user/me',
			headers: {
				authorization: `Bearer ${accessToken}`,
				cookie: `refreshToken=${refreshToken}`,
			},
		})

		expect(profileResponse.statusCode).toBe(200)
		const profileBody = JSON.parse(profileResponse.body)
		expect(profileBody.user.id).toBe(trainer.id)
		expect(profileBody.user.email).toBe(trainer.email!)
	})
})

describe('E2E-тесты: Работа с приглашениями', () => {
	let app: any

	beforeAll(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('клиент приглашает тренера → тренер принимает → связь установлена', async () => {
		// Создаём тренера и клиента через хелперы (для скорости)
		const trainer = await createTrainer('invite-test')
		const client = await createClient('invite-test')

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
		expect(inviteBody.invite).toBeDefined()
		expect(inviteBody.invite.status).toBe('PENDING')

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
		const acceptBody = JSON.parse(acceptResponse.body)
		expect(acceptBody.message).toContain('приняли')

		// Проверяем в БД, что связь установлена
		const trainerClient = await prisma.trainerClient.findFirst({
			where: {
				trainerId: trainer.id,
				clientId: client.id,
			},
		})

		expect(trainerClient).toBeDefined()
		expect(trainerClient!.status).toBe('ACCEPTED')
		expect(trainerClient!.acceptedAt).toBeDefined()

		// Проверяем, что тренер видит клиента в списке
		const clientsResponse = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients',
			headers: {
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
		})

		expect(clientsResponse.statusCode).toBe(200)
		const clientsBody = JSON.parse(clientsResponse.body)
		expect(clientsBody.clients.some((c: any) => c.id === client.id)).toBe(true)
	})
})

describe('E2E-тесты: Управление питанием', () => {
	let app: any

	beforeAll(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterAll(async () => {
		await app.close()
	})

	it('тренер создаёт план питания → клиент видит его', async () => {
		// Создаём тренера и клиента через хелперы
		const trainer = await createTrainer('nutrition-test')
		const client = await createClient('nutrition-test')

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

		// Тренер создаёт категорию
		const categoryName = `Тестовая категория ${Date.now()}`
		const categoryResponse = await app.inject({
			method: 'POST',
			url: '/api/nutrition/categories',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
			payload: {
				name: categoryName,
				description: 'Категория для тестов',
			},
		})

		expect(categoryResponse.statusCode).toBe(201)
		const categoryBody = JSON.parse(categoryResponse.body)
		const categoryId = categoryBody.id

		// Тренер создаёт подкатегорию
		const subcategoryName = `Тестовая подкатегория ${Date.now()}`
		const subcategoryResponse = await app.inject({
			method: 'POST',
			url: `/api/nutrition/categories/${categoryId}/subcategories`,
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
			payload: {
				name: subcategoryName,
				description: 'Подкатегория для тестов',
			},
		})

		expect(subcategoryResponse.statusCode).toBe(201)
		const subcategoryBody = JSON.parse(subcategoryResponse.body)
		const subcategoryId = subcategoryBody.id

		// Тренер создаёт день с приёмами
		const dayResponse = await app.inject({
			method: 'POST',
			url: `/api/nutrition/subcategories/${subcategoryId}/days`,
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
			payload: {
				dayTitle: `День 1 ${Date.now()}`,
				dayOrder: 1,
				meals: [
					{
						type: 'BREAKFAST',
						name: 'Завтрак',
						mealOrder: 1,
						items: ['Овсянка', 'Банан', 'Кофе'],
					},
					{
						type: 'LUNCH',
						name: 'Обед',
						mealOrder: 2,
						items: ['Курица', 'Рис', 'Салат'],
					},
				],
			},
		})

		expect(dayResponse.statusCode).toBe(201)
		const dayBody = JSON.parse(dayResponse.body)
		const dayId = dayBody.id

		// Тренер назначает план клиенту
		const assignResponse = await app.inject({
			method: 'POST',
			url: `/api/trainer/clients/${client.id}/nutrition`,
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${trainerLogin.token}`,
				cookie: `refreshToken=${trainerRefreshToken}`,
			},
			payload: {
				subcategoryId,
				dayIds: [dayId],
			},
		})

		expect(assignResponse.statusCode).toBe(201)
		const assignBody = JSON.parse(assignResponse.body)
		expect(assignBody.plan).toBeDefined()
		expect(assignBody.plan.subcategory.name).toBe(subcategoryName)

		// Авторизуемся как клиент (повторно)
		const clientLogin2 = await loginUser(app, client.email!)
		const clientRefreshToken2 = clientLogin2.cookies.split('=')[1].split(';')[0]

		// Клиент получает план
		const planResponse = await app.inject({
			method: 'GET',
			url: '/api/nutrition/client/plan',
			headers: {
				authorization: `Bearer ${clientLogin2.token}`,
				cookie: `refreshToken=${clientRefreshToken2}`,
			},
		})

		expect(planResponse.statusCode).toBe(200)
		const planBody = JSON.parse(planResponse.body)

		expect(planBody.plan).toBeDefined()
		expect(planBody.plan.subcategory.name).toBe(subcategoryName)
		expect(planBody.days).toHaveLength(1)
		expect(planBody.days[0].meals).toHaveLength(2)
	})
})
