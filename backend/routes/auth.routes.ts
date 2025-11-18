import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma.js'
import { hash } from 'bcryptjs'

import registerSchema from '../schemas/auth/register.schema'

export default async function authRoutes(fastify: FastifyInstance) {
	fastify.post('/signup', { schema: registerSchema }, async (req, reply) => {
		try {
			const data = req.body as {
				name: string
				email: string
				password: string
				age?: number
				weight?: number
				height?: number
				waist?: number
				chest?: number
				hips?: number
				arm?: number
				leg?: number
				goal?: string
				restrictions?: string
				experience?: string
				diet?: string
				photoFront?: string
				photoSide?: string
				photoBack?: string
			}

			const exists = await prisma.user.findUnique({
				where: { email: data.email },
			})

			if (exists) {
				return reply.status(400).send({ error: 'Email уже занят' })
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
			
		} catch (err: any) {
			return reply.status(500).send({ error: err.message })
		}
	})
}
