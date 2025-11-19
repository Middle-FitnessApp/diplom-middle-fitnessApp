import { FastifyInstance } from 'fastify'

import registerSchema from '../schemas/auth/register.schema.js'

import { RegisterDTO, PublicUser } from '../types/auth.js'
import { registerUser } from 'controllers/user.js'

export default async function authRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: RegisterDTO; Reply: PublicUser }>(
		'/signup',
		{ schema: registerSchema },
		async (req, reply) => {
			const user = await registerUser(req.body)

			return reply.status(201).send(user)
		},
	)
}
