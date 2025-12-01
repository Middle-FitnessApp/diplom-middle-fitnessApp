import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'

import { loginUser, logoutUser, registerUser } from '../controllers/user.js'
import { refreshTokenService } from '../services/refreshToken.service.js'

import { getRegisterBodySchema } from '../validation/zod/auth/register.dto.js'
import { loginSchemaZod } from '../validation/zod/auth/login.dto.js'

import { MAX_AGE_30_DAYS } from '../consts/cookie.js'
import { CLIENT } from '../consts/role.js'
import { ApiError } from '../utils/ApiError.js'
import { removeRefreshCookie, setRefreshCookie } from '../utils/refreshCookie.js'
import { uploadPhotos } from '../utils/uploadPhotos.js'
import { authGuard } from '../middleware/authGuard.js'

export default async function authRoutes(app: FastifyInstance) {
	app.register(multipart)

	app.post('/signup', async (req, reply) => {
		const query = req.query as { role?: 'CLIENT' | 'TRAINER' }
		const role = query.role ?? CLIENT

		let body: Record<string, string>
		let files: Record<string, string> = {}

		// Для клиентов обрабатываем фото, для тренеров - только тело запроса
		if (role === CLIENT) {
			const uploadResult = await uploadPhotos(req, [
				'photoFront',
				'photoSide',
				'photoBack',
			])
			body = uploadResult.body
			files = uploadResult.files

			// Проверка обязательных фотографий для клиента
			if (!files.photoFront || !files.photoSide || !files.photoBack) {
				throw ApiError.badRequest(
					'Необходимо загрузить все три фотографии (спереди, сбоку, сзади)',
				)
			}
		} else {
			// Для тренера всегда JSON
			body = req.body as Record<string, string>
		}

		// Валидация тела запроса в зависимости от роли
		const bodySchema = getRegisterBodySchema(role)

		const validatedData = bodySchema.parse(body)
		const user = await registerUser(validatedData, role, files)

		setRefreshCookie(reply, user.token.refreshToken, MAX_AGE_30_DAYS)

		return reply.status(201).send({
			user: user.user,
			token: {
				accessToken: user.token.accessToken,
			},
		})
	})

	app.post('/login', async (req, reply) => {
		const validatedData = loginSchemaZod.body.parse(req.body)
		const user = await loginUser(validatedData)

		setRefreshCookie(reply, user.token.refreshToken, MAX_AGE_30_DAYS)

		return reply.status(200).send({
			user: user.user,
			token: {
				accessToken: user.token.accessToken,
			},
		})
	})

	app.post('/refresh', async (req, reply) => {
		const refreshToken = req.cookies.refreshToken

		if (!refreshToken) {
			throw ApiError.unauthorized('Refresh token отсутствует')
		}

		const result = await refreshTokenService({ refreshToken })

		setRefreshCookie(reply, result.token.refreshToken, MAX_AGE_30_DAYS)

		return reply.status(200).send({
			user: result.user,
			token: {
				accessToken: result.token.accessToken,
			},
		})
	})

	app.post('/logout', { preHandler: authGuard }, async (req, reply) => {
		await logoutUser(req.user.id)

		removeRefreshCookie(reply)

		return reply.status(200).send({ message: 'Вы успешно вышли из аккаунта' })
	})
}
