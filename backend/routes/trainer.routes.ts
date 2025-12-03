import type { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import { getClientsForTrainer, toggleClientStar } from '../controllers/trainer.js'

export default async function trainerRoutes(app: FastifyInstance) {
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

			const isFavorite = await toggleClientStar(trainerId, clientId)

			return reply.status(200).send({ isFavorite })
		},
	)
}
