import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestApp, loginUser } from '../helpers.js'

describe('Интеграционные тесты: Роуты аутентификации', () => {
	let app: any
	let accessToken: string
	let refreshToken: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('POST /api/auth/register - успешная регистрация', async () => {
		const timestamp = Date.now()
		const email = `test-trainer-${timestamp}@example.com`

		const response = await app.inject({
			method: 'POST',
			url: '/api/auth/signup?role=TRAINER',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				name: 'Test Trainer',
				emailOrPhone: email,
				password: 'Test123',
				age: 30,
				bio: 'Опытный тренер',
				telegram: '@testtrainer',
			},
		})

		expect(response.statusCode).toBe(201)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('user')
		expect(body).toHaveProperty('token')
		expect(body.user.role).toBe('TRAINER')
		expect(body.token).toHaveProperty('accessToken')
		// refreshToken устанавливается в cookie, а не возвращается в теле

		// Проверяем, что установлены cookies
		expect(response.headers['set-cookie']).toBeDefined()
		const cookies = response.headers['set-cookie']
		const refreshCookie = Array.isArray(cookies)
			? cookies.find((c: string) => c.startsWith('refreshToken='))
			: cookies
		expect(refreshCookie).toBeDefined()
	})

	it('POST /api/auth/login - успешный логин', async () => {
		const timestamp = Date.now()
		const email = `test-login-${timestamp}@example.com`

		// Сначала регистрируем пользователя
		await app.inject({
			method: 'POST',
			url: '/api/auth/signup?role=TRAINER',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				name: 'Test Login Trainer',
				emailOrPhone: email,
				password: 'Test123',
				age: 30,
				bio: 'Опытный тренер',
				telegram: '@testtrainer',
			},
		})

		// Теперь логинимся
		const response = await app.inject({
			method: 'POST',
			url: '/api/auth/login',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				emailOrPhone: email,
				password: 'Test123',
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('user')
		expect(body).toHaveProperty('token')
		expect(body.user.role).toBe('TRAINER')
		expect(body.token).toHaveProperty('accessToken')
		// refreshToken устанавливается в cookie, а не возвращается в теле

		// Проверяем, что установлены cookies
		expect(response.headers['set-cookie']).toBeDefined()
		const cookies = response.headers['set-cookie']
		const refreshCookie = Array.isArray(cookies)
			? cookies.find((c: string) => c.startsWith('refreshToken='))
			: cookies
		expect(refreshCookie).toBeDefined()
	})

	it('POST /api/auth/refresh - обновление токена', async () => {
		const timestamp = Date.now()
		const email = `test-refresh-${timestamp}@example.com`

		// Регистрируем и логиним пользователя
		await app.inject({
			method: 'POST',
			url: '/api/auth/signup?role=TRAINER',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				name: 'Test Refresh Trainer',
				emailOrPhone: email,
				password: 'Test123',
				age: 30,
				bio: 'Опытный тренер',
				telegram: '@testtrainer',
			},
		})

		const loginResponse = await app.inject({
			method: 'POST',
			url: '/api/auth/login',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				emailOrPhone: email,
				password: 'Test123',
			},
		})

		const cookies = loginResponse.headers['set-cookie']
		const refreshCookie = Array.isArray(cookies)
			? cookies.find((c: string) => c.startsWith('refreshToken='))
			: cookies

		// Обновляем токен
		const response = await app.inject({
			method: 'POST',
			url: '/api/auth/refresh',
			headers: {
				cookie: refreshCookie,
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('token')
		expect(body.token).toHaveProperty('accessToken')
	})
})

describe('Интеграционные тесты: Роуты пользователей', () => {
	let app: any
	let accessToken: string
	let refreshToken: string

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('GET /api/user/me - получение профиля', async () => {
		const timestamp = Date.now()
		const email = `test-profile-${timestamp}@example.com`

		// Регистрируем пользователя
		const registerResponse = await app.inject({
			method: 'POST',
			url: '/api/auth/signup?role=TRAINER',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				name: 'Test Profile Trainer',
				emailOrPhone: email,
				password: 'Test123',
				age: 30,
				bio: 'Опытный тренер',
				telegram: '@testtrainer',
			},
		})

		const cookies = registerResponse.headers['set-cookie']
		const refreshCookie = Array.isArray(cookies)
			? cookies.find((c: string) => c.startsWith('refreshToken='))
			: cookies

		accessToken = JSON.parse(registerResponse.body).token.accessToken
		refreshToken = refreshCookie

		expect(registerResponse.statusCode).toBe(201)

		// Использую токены в запросах
		const response = await app.inject({
			method: 'GET',
			url: '/api/user/me',
			headers: {
				authorization: `Bearer ${accessToken}`,
				cookie: refreshToken,
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)

		expect(body).toHaveProperty('user')
		expect(body.user.email).toBe(email)
		expect(body.user.name).toBe('Test Profile Trainer')
		expect(body.user.role).toBe('TRAINER')
	})

	it('GET /api/trainer/:id - получение профиля тренера', async () => {
		// Регистрируем тренера
		const timestamp = Date.now()
		const email = `test-trainer-profile-${timestamp}@example.com`

		const registerResponse = await app.inject({
			method: 'POST',
			url: '/api/auth/signup?role=TRAINER',
			headers: {
				'content-type': 'application/json',
			},
			payload: {
				name: 'Test Profile Trainer',
				emailOrPhone: email,
				password: 'Test123',
				age: 30,
				bio: 'Опытный тренер',
				telegram: '@testtrainer',
			},
		})

		expect(registerResponse.statusCode).toBe(201)

		const registerBody = JSON.parse(registerResponse.body)
		const accessToken = registerBody.token.accessToken

		const cookies = registerResponse.headers['set-cookie']
		const refreshCookie = Array.isArray(cookies)
			? cookies.find((c: string) => c.startsWith('refreshToken='))
			: cookies
		const refreshToken = refreshCookie

		// После успешной авторизации получаем данные о тренере через /me
		const meResponse = await app.inject({
			method: 'GET',
			url: '/api/user/me',
			headers: {
				authorization: `Bearer ${accessToken}`,
				cookie: refreshToken,
			},
		})

		expect(meResponse.statusCode).toBe(200)
		const meBody = JSON.parse(meResponse.body)
		expect(meBody).toHaveProperty('user')
		const trainerId = meBody.user.id

		// Использую корректный маршрут с токеном
		const response = await app.inject({
			method: 'GET',
			url: `/api/trainer/${trainerId}`,
			headers: {
				authorization: `Bearer ${accessToken}`,
			},
		})

		expect(response.statusCode).toBe(200)

		const body = JSON.parse(response.body)
		expect(body).toHaveProperty('trainer')
		expect(body.trainer.name).toBe('Test Profile Trainer')
		expect(body.trainer.age).toBe(30)
		expect(body.trainer.bio).toBe('Опытный тренер')
		expect(body.trainer.telegram).toBe('@testtrainer')
	})
})
