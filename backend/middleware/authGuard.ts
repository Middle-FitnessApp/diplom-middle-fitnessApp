import { FastifyRequest } from 'fastify'
import { verifyAccessToken } from '../services/token.service.js'
import { ApiError } from '../utils/ApiError.js'
import { prisma } from '../prisma.js'

export async function authGuard(req: FastifyRequest) {
	const header = req.headers.authorization

	if (!header) {
		throw ApiError.unauthorized('Пользователь не авторизован')
	}

	const token = header.split(' ')[1]

	if (!token) {
		throw ApiError.unauthorized('Токен отсутствует в заголовке')
	}

	const refreshToken = req.cookies?.refreshToken

	if (!refreshToken) {
		throw ApiError.unauthorized('Пользователь не авторизован')
	}

	try {
		const payload = verifyAccessToken(token)

		// Проверяем, что refreshToken из cookies соответствует тому, что в payload accessToken
		const tokenInDb = await prisma.refreshToken.findUnique({
			where: {
				id: payload.refreshTokenId,
				token: refreshToken,
			},
		})

		if (!tokenInDb) {
			throw ApiError.unauthorized('Токены не связаны или refresh token недействителен')
		}

		// Проверяем, существует ли пользователь с таким ID в БД
		const user = await prisma.user.findUnique({
			where: { id: payload.user.id },
			select: { id: true, role: true },
		})

		if (!user) {
			throw ApiError.unauthorized('Пользователь не найден')
		}

		req.user = {
			id: user.id,
			role: user.role,
		}
	} catch (err: unknown) {
		if (err instanceof ApiError) {
			throw err
		}

		if (err instanceof Error && err.name === 'TokenExpiredError') {
			throw ApiError.unauthorized('Токен истёк')
		}

		if (err instanceof Error) {
			throw ApiError.unauthorized(`Неверный токен: ${err.message}`)
		}

		throw ApiError.unauthorized('Неверный токен')
	}
}
