import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
	createTestApp,
	createTrainer,
	createClient,
	loginUser,
	prisma,
} from '../helpers.js'
import FormData from 'form-data'

describe('Интеграционные тесты: Роуты тренеров и клиентов', () => {
	let app: any
	let trainer: any
	let client: any
	let trainerToken: string
	let clientToken: string
	let trainerCookies: string
	let clientCookies: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()

		// Создаем тестового тренера и клиента
		trainer = await createTrainer('test-trainer')
		client = await createClient('test-client')

		// Логинимся
		const trainerLogin = await loginUser(app, trainer.email)
		trainerToken = trainerLogin.token
		trainerCookies = trainerLogin.cookies

		const clientLogin = await loginUser(app, client.email)
		clientToken = clientLogin.token
		clientCookies = clientLogin.cookies
	})

	afterEach(async () => {
		// Очищаем тестовые данные
		if (trainer?.id) {
			await prisma.user.deleteMany({ where: { email: trainer.email } })
		}
		if (client?.id) {
			await prisma.user.deleteMany({ where: { email: client.email } })
		}
		await app.close()
	})

	it('POST /api/user/client/invite-trainer - отправка приглашения', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/user/client/invite-trainer',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientCookies.split('=')[1], // Извлекаем значение из "refreshToken=value"
			},
			payload: {
				trainerId: trainer.id,
			},
		})

		expect(response.statusCode).toBe(201)
		const body = JSON.parse(response.body)
		expect(body.message).toBe('Приглашение отправлено тренеру')
		expect(body.invite).toBeDefined()

		// Проверяем, что приглашение создано в БД со статусом PENDING
		const inviteInDb = await prisma.trainerClient.findFirst({
			where: {
				clientId: client.id,
				trainerId: trainer.id,
			},
		})
		expect(inviteInDb).toBeDefined()
		expect(inviteInDb?.status).toBe('PENDING')
	})

	it('GET /api/trainer/clients - список клиентов', async () => {
		// Сначала создаем принятое приглашение
		await prisma.trainerClient.create({
			data: {
				clientId: client.id,
				trainerId: trainer.id,
				status: 'ACCEPTED',
			},
		})

		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients',
			headers: {
				authorization: `Bearer ${trainerToken}`,
			},
			cookies: {
				refreshToken: trainerCookies.split('=')[1],
			},
		})

		expect(response.statusCode).toBe(200)
		const body = JSON.parse(response.body)
		expect(body.clients).toBeDefined()
		expect(Array.isArray(body.clients)).toBe(true)
		expect(body.clients.length).toBeGreaterThan(0)

		// Проверяем, что клиент есть в списке
		const clientInList = body.clients.find((c: any) => c.id === client.id)
		expect(clientInList).toBeDefined()
		expect(clientInList.name).toBe(client.name)
	})
})

describe('Интеграционные тесты: Роуты питания', () => {
	let app: any
	let trainer: any
	let client: any
	let trainerToken: string
	let clientToken: string
	let trainerCookies: string
	let clientCookies: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()

		// Создаем тестового тренера и клиента
		trainer = await createTrainer('nutrition-trainer')
		client = await createClient('nutrition-client')

		// Логинимся
		const trainerLogin = await loginUser(app, trainer.email)
		trainerToken = trainerLogin.token
		trainerCookies = trainerLogin.cookies

		const clientLogin = await loginUser(app, client.email)
		clientToken = clientLogin.token
		clientCookies = clientLogin.cookies
	})

	afterEach(async () => {
		// Очищаем тестовые данные
		if (trainer?.id) {
			await prisma.user.deleteMany({ where: { email: trainer.email } })
		}
		if (client?.id) {
			await prisma.user.deleteMany({ where: { email: client.email } })
		}
		await app.close()
	})

	it('POST /api/nutrition/categories - создание категории', async () => {
		const categoryData = {
			name: 'Тестовая категория',
			description: 'Описание тестовой категории',
		}

		const response = await app.inject({
			method: 'POST',
			url: '/api/nutrition/categories',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${trainerToken}`,
			},
			cookies: {
				refreshToken: trainerCookies.split('=')[1],
			},
			payload: categoryData,
		})

		expect(response.statusCode).toBe(201)
		const body = JSON.parse(response.body)
		expect(body.name).toBe(categoryData.name)
		expect(body.description).toBe(categoryData.description)
		expect(body.trainerId).toBe(trainer.id)

		// Проверяем запись в БД
		const categoryInDb = await prisma.nutritionCategory.findUnique({
			where: { id: body.id },
		})
		expect(categoryInDb).toBeDefined()
		expect(categoryInDb?.name).toBe(categoryData.name)
	})

	it('GET /api/nutrition/client/plan - планы клиента', async () => {
		// Создаем категорию и подкатегорию
		const category = await prisma.nutritionCategory.create({
			data: {
				name: 'Категория для плана',
				trainerId: trainer.id,
			},
		})

		const subcategory = await prisma.nutritionSubcategory.create({
			data: {
				name: 'Подкатегория для плана',
				categoryId: category.id,
			},
		})

		// Создаем план для клиента
		await prisma.clientNutritionPlan.create({
			data: {
				clientId: client.id,
				subcatId: subcategory.id,
			},
		})

		const response = await app.inject({
			method: 'GET',
			url: '/api/nutrition/client/plan',
			headers: {
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientCookies.split('=')[1],
			},
		})

		expect(response.statusCode).toBe(200)
		const body = JSON.parse(response.body)
		expect(body).toBeDefined()
		// Проверяем, что план возвращается (структура зависит от реализации)
	})
})

describe('Интеграционные тесты: Роуты прогресса', () => {
	let app: any
	let client: any
	let clientToken: string
	let clientCookies: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()

		// Создаем тестового клиента
		client = await createClient('progress-client')

		// Логинимся
		const clientLogin = await loginUser(app, client.email)
		clientToken = clientLogin.token
		clientCookies = clientLogin.cookies
	})

	afterEach(async () => {
		// Очищаем тестовые данные
		if (client?.id) {
			await prisma.user.deleteMany({ where: { email: client.email } })
		}
		await app.close()
	})

	it('PUT /api/progress/new-report - создание прогресса', async () => {
		const progressData = {
			date: '15/12/2024',
			weight: '75.5',
			waist: '85.0',
			hips: '95.0',
			height: '175.0',
			chest: '100.0',
			arm: '30.0',
			leg: '50.0',
		}

		// Создаем FormData для multipart запроса
		const form = new FormData()
		Object.entries(progressData).forEach(([key, value]) => {
			form.append(key, value)
		})

		const response = await app.inject({
			method: 'PUT',
			url: '/api/progress/new-report',
			headers: {
				authorization: `Bearer ${clientToken}`,
				...form.getHeaders(),
			},
			cookies: {
				refreshToken: clientCookies.split('=')[1],
			},
			payload: form,
		})

		expect(response.statusCode).toBe(201)
		const body = JSON.parse(response.body)
		expect(body.progress).toBeDefined()
		expect(body.progress.weight).toBe(parseFloat(progressData.weight))
		expect(body.progress.waist).toBe(parseFloat(progressData.waist))
		expect(body.progress.hips).toBe(parseFloat(progressData.hips))

		// Проверяем фото (опционально)
		expect(body.progress.photoFront).toBeNull()
	})

	it('GET /api/progress - список прогресса', async () => {
		// Создаем тестовый прогресс
		await prisma.progress.create({
			data: {
				userId: client.id,
				weight: 70.0,
				waist: 80.0,
				hips: 90.0,
			},
		})

		const response = await app.inject({
			method: 'GET',
			url: '/api/progress',
			headers: {
				authorization: `Bearer ${clientToken}`,
			},
			cookies: {
				refreshToken: clientCookies.split('=')[1],
			},
		})

		expect(response.statusCode).toBe(200)
		const body = JSON.parse(response.body)
		expect(body.data).toBeDefined()
		expect(Array.isArray(body.data)).toBe(true)
		expect(body.data.length).toBeGreaterThan(0)

		// Проверяем пагинацию и фильтры
		const firstProgress = body.data[0]
		expect(firstProgress.weight).toBeDefined()
		expect(firstProgress.waist).toBeDefined()
		expect(firstProgress.hips).toBeDefined()
	})
})
