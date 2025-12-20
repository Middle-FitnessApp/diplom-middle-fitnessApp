import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
	createTrainer,
	createClient,
	loginUser,
	prisma,
	createTestApp,
} from '../helpers.js'
import { FastifyInstance } from 'fastify'

describe('Приглашение: Отклонение тренером', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('тренер отклоняет приглашение → статус REJECTED', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		const invite = await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${invite.id}/reject`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)

		const updatedInvite = await prisma.trainerClient.findUnique({
			where: { id: invite.id },
		})

		expect(updatedInvite?.status).toBe('REJECTED')
	})

	it('нельзя отклонить уже обработанное приглашение', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		const invite = await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${invite.id}/reject`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(400)
	})
})
