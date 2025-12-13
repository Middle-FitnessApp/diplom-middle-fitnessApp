import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTrainer, createClient, loginUser, prisma } from '../helpers.js'
import { buildApp } from '../../app.js'
import { FastifyInstance } from 'fastify'

describe('Приглашение: Отправка клиентом', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await buildApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('клиент отправляет приглашение → статус PENDING', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

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

		expect(response.statusCode).toBe(201)

		const body = JSON.parse(response.body)
		expect(body.invite).toBeDefined()
		expect(body.invite.status).toBe('PENDING')

		const invite = await prisma.trainerClient.findFirst({
			where: {
				trainerId: trainer.id,
				clientId: client.id,
			},
		})

		expect(invite).toBeTruthy()
		expect(invite?.status).toBe('PENDING')
	})

	it('приглашение создаётся с isFavorite = false по умолчанию', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		const { token, cookies } = await loginUser(app, client.email!)

		await app.inject({
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

		const invite = await prisma.trainerClient.findFirst({
			where: { clientId: client.id, trainerId: trainer.id },
		})

		expect(invite?.isFavorite).toBe(false)
	})
})
