import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTrainer, createClient, loginUser, prisma } from '../helpers.js'
import { buildApp } from '../../app.js'
import { FastifyInstance } from 'fastify'

describe('Права доступа', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await buildApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('клиент не может получить приглашения тренера', async () => {
		// 👈 Изменено название
		const trainer = await createTrainer()
		const client1 = await createClient('1')
		const client2 = await createClient('2')

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client1.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, client2.email!)

		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/invites',
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(403) // 👈 ИСПРАВЛЕНО: 403 Forbidden
	})

	it('тренер не может принять приглашение другого тренера', async () => {
		const trainer1 = await createTrainer('1')
		const trainer2 = await createTrainer('2')
		const client = await createClient()

		const invite = await prisma.trainerClient.create({
			data: {
				trainerId: trainer1.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, trainer2.email!)

		const response = await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${invite.id}/accept`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(403)
	})

	it('CLIENT не имеет доступа к эндпоинтам тренера', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		const { token, cookies } = await loginUser(app, client.email!)

		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients',
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(403)
	})

	it('неавторизованный пользователь не может получить список клиентов', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients',
		})

		expect(response.statusCode).toBe(401)
	})

	it('невалидный токен возвращает 401', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients',
			headers: {
				authorization: 'Bearer invalid-token-123',
				cookie: 'refreshToken=fake',
			},
		})

		expect(response.statusCode).toBe(401)
	})
})
