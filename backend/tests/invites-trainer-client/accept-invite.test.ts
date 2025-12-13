import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTrainer, createClient, loginUser, prisma } from '../helpers.js'
import { buildApp } from '../../app.js'
import { FastifyInstance } from 'fastify'

describe('Приглашение: Принятие тренером', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await buildApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('тренер принимает приглашение → статус ACCEPTED + acceptedAt', async () => {
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
			url: `/api/trainer/invites/${invite.id}/accept`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)

		const updatedInvite = await prisma.trainerClient.findUnique({
			where: { id: invite.id },
		})

		expect(updatedInvite?.status).toBe('ACCEPTED')
		expect(updatedInvite?.acceptedAt).toBeTruthy()
	})

	it('при принятии отклоняются все другие PENDING приглашения клиента', async () => {
		const trainer1 = await createTrainer('1')
		const trainer2 = await createTrainer('2')
		const client = await createClient()

		const invite1 = await prisma.trainerClient.create({
			data: {
				trainerId: trainer1.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const invite2 = await prisma.trainerClient.create({
			data: {
				trainerId: trainer2.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, trainer1.email!)

		await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${invite1.id}/accept`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		const rejectedInvite = await prisma.trainerClient.findUnique({
			where: { id: invite2.id },
		})

		expect(rejectedInvite?.status).toBe('REJECTED')
	})

	it('создаётся чат между тренером и клиентом при принятии', async () => {
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

		await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${invite.id}/accept`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		const chat = await prisma.chat.findFirst({
			where: {
				trainerId: trainer.id,
				clientId: client.id,
			},
		})

		expect(chat).toBeTruthy()
	})

	it('нельзя принять уже обработанное приглашение', async () => {
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
			url: `/api/trainer/invites/${invite.id}/accept`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(400)
	})

	it('нельзя принять приглашение если клиент уже работает с другим тренером', async () => {
		const trainer1 = await createTrainer('1')
		const trainer2 = await createTrainer('2')
		const client = await createClient()

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer1.id,
				clientId: client.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		})

		const invite2 = await prisma.trainerClient.create({
			data: {
				trainerId: trainer2.id,
				clientId: client.id,
				status: 'PENDING',
			},
		})

		const { token, cookies } = await loginUser(app, trainer2.email!)

		const response = await app.inject({
			method: 'POST',
			url: `/api/trainer/invites/${invite2.id}/accept`,
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(409) // 👈 ИСПРАВЛЕНО: 409 Conflict
	})
})
