import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
	createTrainer,
	createClient,
	loginUser,
	prisma,
	createTestApp,
} from '../helpers.js'
import { FastifyInstance } from 'fastify'

describe('Избранные клиенты', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await createTestApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('тренер может добавить ACCEPTED клиента в избранное', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'PUT',
			url: `/api/trainer/clients/${client.id}/favorite`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)

		const updatedInvite = await prisma.trainerClient.findUnique({
			where: {
				clientId_trainerId: {
					clientId: client.id,
					trainerId: trainer.id,
				},
			},
		})

		expect(updatedInvite?.isFavorite).toBe(true)
	})

	it('повторный вызов убирает клиента из избранного (toggle)', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
				isFavorite: true,
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'PUT',
			url: `/api/trainer/clients/${client.id}/favorite`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)

		const updatedInvite = await prisma.trainerClient.findUnique({
			where: {
				clientId_trainerId: {
					clientId: client.id,
					trainerId: trainer.id,
				},
			},
		})

		expect(updatedInvite?.isFavorite).toBe(false)
	})

	it('нельзя добавить в избранное клиента не в статусе ACCEPTED', async () => {
		const trainer = await createTrainer()
		const client = await createClient()

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'PUT',
			url: `/api/trainer/clients/${client.id}/favorite`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(403) // 👈 ИСПРАВЛЕНО: 403 Forbidden
	})

	it('нельзя добавить в избранное несуществующего клиента', async () => {
		const trainer = await createTrainer()

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'PUT',
			url: `/api/trainer/clients/nonexistent-id/favorite`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(404)
	})
})
