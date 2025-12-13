import { PrismaClient } from '@prisma/client'
import { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'

export const prisma = new PrismaClient()

console.log('DATABASE_URL:', process.env.DATABASE_URL)

interface LoginResponse {
	user: {
		id: string
		email: string
		role: string
	}
	token: {
		accessToken: string
	}
}

/**
 * Создание тренера для тестов
 */
export async function createTrainer(suffix: string = '') {
	const timestamp = Date.now() + Math.random()
	const email = `trainer-${timestamp}${suffix}@test.com`

	const hashedPassword = await bcrypt.hash('Test123!@#', 10)

	const trainer = await prisma.user.create({
		data: {
			name: `Test Trainer ${suffix}`,
			email,
			password: hashedPassword,
			role: 'TRAINER',
			age: 30,
			bio: 'Опытный тренер с 5-летним стажем',
			telegram: '@testtrainer',
		},
	})

	return trainer
}

/**
 * Создание клиента для тестов
 */
export async function createClient(suffix: string = '') {
	const timestamp = Date.now() + Math.random()
	const email = `client-${timestamp}${suffix}@test.com`

	const hashedPassword = await bcrypt.hash('Test123!@#', 10)

	const client = await prisma.user.create({
		data: {
			name: `Test Client ${suffix}`,
			email,
			password: hashedPassword,
			role: 'CLIENT',
			age: 25,
			goal: 'Набрать мышечную массу',
			experience: 'Новичок',
		},
	})

	return client
}

/**
 * Авторизация пользователя через API
 * Возвращает accessToken и refreshToken cookie
 */
export async function loginUser(
	app: FastifyInstance,
	emailOrPhone: string, // 👈 Теперь принимает string напрямую
	password: string = 'Test123!@#',
) {
	const response = await app.inject({
		method: 'POST',
		url: '/api/auth/login',
		headers: {
			'content-type': 'application/json',
		},
		payload: {
			emailOrPhone,
			password,
		},
	})

	if (response.statusCode !== 200) {
		console.error('❌ Login failed:', {
			statusCode: response.statusCode,
			body: response.body,
			emailOrPhone,
			password,
		})
		throw new Error(`Login failed: ${response.body}`)
	}

	const body = JSON.parse(response.body) as LoginResponse
	const setCookieHeader = response.headers['set-cookie']

	// Извлекаем refreshToken из Set-Cookie header
	let refreshTokenCookie = ''
	if (Array.isArray(setCookieHeader)) {
		const refreshCookie = setCookieHeader.find((c) => c.startsWith('refreshToken='))
		if (refreshCookie) {
			refreshTokenCookie = refreshCookie.split(';')[0]
		}
	} else if (typeof setCookieHeader === 'string') {
		refreshTokenCookie = setCookieHeader.split(';')[0]
	}

	return {
		token: body.token.accessToken,
		userId: body.user.id,
		cookies: refreshTokenCookie,
	}
}
