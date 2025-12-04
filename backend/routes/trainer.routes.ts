import type { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import {
	getAllTrainers,
	getClientsForTrainer,
	toggleClientFavorite,
} from '../controllers/trainer.js'

export default async function trainerRoutes(app: FastifyInstance) {
	// Публичный эндпоинт - просмотр всех тренеров
	app.get('/all', async (req, reply) => {
		const trainers = await getAllTrainers()
		return reply.status(200).send({ trainers })
	})

	// список клиентов тренера
	app.get(
		'/clients',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const trainerId = req.user.id
			const clients = await getClientsForTrainer(trainerId)
			return reply.status(200).send({ clients })
		},
	)

	app.patch(
		'/clients/:clientId/favorite',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const trainerId = req.user.id
			const { clientId } = req.params as { clientId: string }

			const isFavorite = await toggleClientFavorite(trainerId, clientId)

			return reply.status(200).send({ isFavorite })
		},
	)
}
