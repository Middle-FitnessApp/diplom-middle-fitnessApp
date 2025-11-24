import { FastifyRequest } from 'fastify'
import { verifyAccessToken } from 'services/token.service.js'
import { ApiError } from 'utils/ApiError.js'

export async function authGuard(req: FastifyRequest) {
	const header = req.headers.authorization

	if (!header) {
		throw ApiError.unauthorized('Пользователь не авторизован')
	}

	const token = header.split(' ')[1]

	if (!token) {
		throw ApiError.unauthorized('Токен отсутствует в заголовке')
	}

	try {
		const payload = verifyAccessToken(token)

		req.user = {
			id: payload.user.id,
			role: 'CLIENT' as 'CLIENT' | 'TRAINER', // временное значение, можно получить из БД если нужно
		}

	} catch (err: unknown) {
		console.error('Ошибка верификации токена:', err)

		if (err instanceof Error && err.name === 'TokenExpiredError') {
			throw ApiError.unauthorized('Токен истёк')
		}

		if (err instanceof Error) {
			throw ApiError.unauthorized(`Неверный токен: ${err.message}`)
		}

		throw ApiError.unauthorized('Неверный токен')
	}
}
