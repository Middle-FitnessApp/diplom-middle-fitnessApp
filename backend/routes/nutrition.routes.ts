import type { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import { getClientNutritionPlan } from '../services/nutrition.service.js'

export default async function nutritionRoutes(app: FastifyInstance) {
	// План питания для текущего клиента (CLIENT)
	app.get(
		'/client/plan',
		{ preHandler: [authGuard, hasRole(['CLIENT'])] },
		async (req, reply) => {
			const clientId = req.user.id

			const days = await getClientNutritionPlan(clientId)

			return reply.status(200).send(days)
		},
	)
}
