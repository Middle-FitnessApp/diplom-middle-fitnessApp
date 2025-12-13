import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTrainer, createClient, loginUser, prisma } from '../helpers.js'
import { buildApp } from '../../app.js'
import { FastifyInstance } from 'fastify'

describe('Список клиентов тренера', () => {
	let app: FastifyInstance

	beforeEach(async () => {
		app = await buildApp()
		await app.ready()
	})

	afterEach(async () => {
		await app.close()
	})

	it('тренер получает список только ACCEPTED клиентов', async () => {
		const trainer = await createTrainer()
		const client1 = await createClient('1')
		const client2 = await createClient('2')
		const client3 = await createClient('3')

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client1.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		})

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client2.id,
				status: 'PENDING',
			},
		})

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client3.id,
				status: 'REJECTED',
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients',
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)
		const body = JSON.parse(response.body)

		expect(body.clients).toHaveLength(1)
		expect(body.clients[0].id).toBe(client1.id)
	})

	it('тренер может фильтровать по избранным клиентам', async () => {
		const trainer = await createTrainer()
		const client1 = await createClient('1')
		const client2 = await createClient('2')

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client1.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
				isFavorite: true,
			},
		})

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client2.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
				isFavorite: false,
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients?favorites=true',
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)
		const body = JSON.parse(response.body)

		expect(body.clients).toHaveLength(1)
		expect(body.clients[0].id).toBe(client1.id)
	})

	it('поиск по имени клиента работает корректно', async () => {
		const trainer = await createTrainer()
		const client1 = await createClient('Alice')
		const client2 = await createClient('Bob')

		// Обновляем имена клиентов для поиска
		await prisma.user.update({
			where: { id: client1.id },
			data: { name: 'Alice Smith' },
		})

		await prisma.user.update({
			where: { id: client2.id },
			data: { name: 'Bob Johnson' },
		})

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client1.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		})

		await prisma.trainerClient.create({
			data: {
				trainerId: trainer.id,
				clientId: client2.id,
				status: 'ACCEPTED',
				acceptedAt: new Date(),
			},
		})

		const { token, cookies } = await loginUser(app, trainer.email!)

		const response = await app.inject({
			method: 'GET',
			url: '/api/trainer/clients?search=Alice',
			headers: {
				authorization: `Bearer ${token}`,
				cookie: cookies,
			},
		})

		expect(response.statusCode).toBe(200)
		const body = JSON.parse(response.body)

		expect(body.clients).toHaveLength(1)
		expect(body.clients[0].name).toBe('Alice Smith')
	})
})
