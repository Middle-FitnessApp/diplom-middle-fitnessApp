import 'fastify'
import type { UserRole } from '@prisma/client'
import { Server as SocketIOServer } from 'socket.io'

declare module 'fastify' {
	interface FastifyRequest {
		user: {
			id: string
			role: UserRole
		}
	}

	interface FastifyInstance {
		io?: SocketIOServer
	}
}
