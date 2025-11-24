import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'

import { loginUser, logoutUser, registerUser } from 'controllers/user.js'
import { refreshTokenService } from 'services/refreshToken.service.js'

import { getRegisterBodySchema } from '../validation/zod/auth/register.dto.js'
import { loginSchemaZod } from '../validation/zod/auth/login.dto.js'
import { registerSchemaSwagger } from '../swagger/auth/register.schema.js'
import { loginSchemaSwagger } from '../swagger/auth/login.schema.js'

import { MAX_AGE_30_DAYS } from 'consts/cookie.js'
import { CLIENT } from 'consts/role.js'
import { ApiError } from 'utils/ApiError.js'
import { removeRefreshCookie, setRefreshCookie } from 'utils/refreshCookie.js'
import { uploadPhotos } from '../utils/uploadPhotos.js'
import { authGuard } from 'middleware/auth.js'

export default async function authRoutes(app: FastifyInstance) {
	app.register(multipart)

	app.post('/signup', { schema: registerSchemaSwagger }, async (req, reply) => {
		try {
			const { body, files } = await uploadPhotos(req, [
				'photoFront',
				'photoSide',
				'photoBack',
			])

			const query = req.query as { role?: 'CLIENT' | 'TRAINER' }
			const role = query.role ?? CLIENT

			// Валидация тела запроса в зависимости от роли
			const bodySchema = getRegisterBodySchema(role)
			const parsed = bodySchema.safeParse(body)

			if (!parsed.success) {
				return reply.status(400).send({ error: parsed.error.flatten() })
			}

			const user = await registerUser(parsed.data, role, files)

			setRefreshCookie(reply, user.token.refreshToken, MAX_AGE_30_DAYS)

			return reply.status(201).send({
				user: user.user,
				token: {
					accessToken: user.token.accessToken,
				},
			})
		} catch (error) {
			if (error instanceof Error) {
				return reply.status(400).send({ error: error.message })
			}
			throw error
		}
	})

	app.post('/login', { schema: loginSchemaSwagger }, async (req, reply) => {
		const body = req.body

		// Валидация через Zod
		const parsed = loginSchemaZod.body.safeParse(body)
		if (!parsed.success) {
			return reply.status(400).send({ error: parsed.error.flatten() })
		}

		const user = await loginUser(parsed.data)

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
