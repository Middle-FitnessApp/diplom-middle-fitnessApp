import 'fastify'
import type { UserRole, PrismaClient } from '@prisma/client'
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
		// prisma добавляется через плагин/decorate
		prisma: PrismaClient
		// httpErrors иногда не явно типизирован; укажем any для совместимости
		httpErrors: any
	}
}
