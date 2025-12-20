import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
	createTrainer,
	createClient,
	loginUser,
	prisma,
	createTestApp,
} from '../helpers.js'
import { FastifyInstance } from 'fastify'

describe('Приглашение: Дубликаты', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('нельзя отправить повторное приглашение одному тренеру', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, client.email!)

		const response = await app.inject({
			method: 'POST',
			url: '/api/user/client/invite-trainer',
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
			payload: {
				trainerId: trainer.id,
			},
		})

		expect(response.statusCode).toBe(400)
	})
})
