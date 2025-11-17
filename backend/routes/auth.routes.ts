import { FastifyInstance } from 'fastify'
import { prisma } from '../prisma.js'
import { hash } from 'bcryptjs'

export default async function authRoutes(fastify: FastifyInstance) {

	fastify.post('/signup', async (req, reply) => {
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

			if (!data?.email) {
				return reply.status(400).send({ error: 'Email обязателен' })
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
			})

			const { password, ...publicUser } = user
			
			return reply.send(publicUser)
		} catch (err: any) {
			return reply.status(500).send({ error: err.message })
		}
	})
}
