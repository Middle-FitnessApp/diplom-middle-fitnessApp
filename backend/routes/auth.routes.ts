import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma.js'
import { hash } from 'bcryptjs'

import registerSchema from '../schemas/auth/register.schema.js'

import { RegisterDTO, PublicUser } from '../types/auth.js'
import { ApiError } from '../utils/ApiError.js'

export default async function authRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: RegisterDTO; Reply: PublicUser }>(
		'/signup',
		{ schema: registerSchema },
		async (req, reply) => {
			const data = req.body as RegisterDTO

			const exists = await prisma.user.findUnique({
				where: { email: data.email },
			})

			if (exists) {
				throw ApiError.badRequest('Email уже занят')
			}

			const passwordHash = await hash(data.password, 10)

			const user = await prisma.user.create({
				data: {
					...data,
					password: passwordHash,
				},
				select: {
					id: true,
					name: true,
					email: true,
				},
			})

			return reply.status(201).send(user)
		},
	)
}
