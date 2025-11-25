import { getUser } from 'controllers/user.js'
import { FastifyInstance } from 'fastify'

import { authGuard } from 'middleware/authGuard.js'
import { hasRole } from 'middleware/hasRole.js'

export default async function userRoutes(app: FastifyInstance) {
	app.get(
		'/me',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {

			const user = await getUser(req.user.id)


			return reply.status(200).send({ user })
		},
	)
}
