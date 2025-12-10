import { Socket } from 'socket.io'
import { verifyAccessToken } from '../services/token.service.js'
import { prisma } from '../prisma.js'

export interface AuthenticatedSocket extends Socket {
	user: {
		id: string
		role: 'CLIENT' | 'TRAINER'
	}
}

export const socketAuthMiddleware = async (
	socket: Socket,
	next: (err?: Error) => void,
) => {
	const token = socket.handshake.auth.token

	if (!token) {
		return next(new Error('Токен отсутствует'))
	}

	try {
		const payload = verifyAccessToken(token)

		// Проверяем refreshToken в БД
		const refreshToken = socket.handshake.auth.refreshToken
		if (!refreshToken) {
			return next(new Error('Refresh токен отсутствует'))
		}

		const tokenInDb = await prisma.refreshToken.findUnique({
			where: {
				id: payload.refreshTokenId,
				token: refreshToken,
			},
		})

		if (!tokenInDb) {
			return next(new Error('Токены не связаны'))
		}

		// Проверяем пользователя
		const user = await prisma.user.findUnique({
			where: { id: payload.user.id },
			select: { id: true, role: true },
		})

		if (!user) {
			return next(new Error('Пользователь не найден'))
		}

		;(socket as AuthenticatedSocket).user = user
		next()
	} catch (err) {
		next(new Error('Неверный токен'))
	}
}
