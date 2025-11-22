import { FastifyRequest } from 'fastify'
import { verifyAccessToken } from 'services/token.service.js'
import { ApiError } from 'utils/ApiError.js'

export async function authGuard(req: FastifyRequest) {
	const header = req.headers.authorization

	if (!header) {
		throw ApiError.unauthorized('Пользователь не авторизован')
	}

	const token = header.split(' ')[1]

	try {
		const payload = verifyAccessToken(token)
		req.user = payload
	} catch (err: unknown) {
		if (err instanceof Error && err.name === 'TokenExpiredError') {
			throw ApiError.unauthorized('Токен истёк')
		}

		throw ApiError.unauthorized('Неверный токен')
	}
}
