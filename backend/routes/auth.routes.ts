import { FastifyInstance } from 'fastify'

import registerSchema from '../schemas/auth/register.schema.js'
import loginSchema from '../schemas/auth/login.schema.js'

import { RegisterDTO, UserWithToken, LoginDTO } from '../types/auth.js'
import { loginUser, registerUser } from 'controllers/user.js'

export default async function authRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: RegisterDTO; Reply: UserWithToken }>(
		'/signup',
		{ schema: registerSchema },
		async (req, reply) => {
			const user = await registerUser(req.body)

			return reply.status(201).send(user)
		},
	)

	fastify.post<{ Body: LoginDTO; Reply: UserWithToken }>(
		'/login',
		{ schema: loginSchema },
		async (req, reply) => {
			const user = await loginUser(req.body)

			return reply.status(200).send(user)
		},
	)
}
