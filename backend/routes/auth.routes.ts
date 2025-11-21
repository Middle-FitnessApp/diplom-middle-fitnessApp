import { FastifyInstance } from 'fastify'

import registerSchema from '../schemas/auth/register.schema.js'
import loginSchema from '../schemas/auth/login.schema.js'

import { RegisterDTO, RoleWithToken, LoginDTO, QuerystringRole } from '../types/auth.js'
import { loginUser, registerUser } from 'controllers/user.js'
import { refreshTokenService } from 'services/refreshToken.service.js'
import { MAX_AGE_30_DAYS } from 'consts/cookie.js'
import { ApiError } from 'utils/ApiError.js'
import { setRefreshCookie } from 'utils/setRefreshCookie.js'
import { CLIENT } from 'consts/role.js'

export default async function authRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Body: RegisterDTO
		Querystring: QuerystringRole
		Reply: RoleWithToken
	}>('/signup', { schema: registerSchema }, async (req, reply) => {
		const role = req.query.role ?? CLIENT

		const user = await registerUser({ ...req.body, role })

		setRefreshCookie(reply, user.token.refreshToken, MAX_AGE_30_DAYS)

		return reply.status(201).send({
			user: user.user,
			token: {
				accessToken: user.token.accessToken,
			},
		})
	})

	fastify.post<{ Body: LoginDTO; Reply: RoleWithToken }>(
		'/login',
		{ schema: loginSchema },
		async (req, reply) => {
			const user = await loginUser(req.body)

			setRefreshCookie(reply, user.token.refreshToken, MAX_AGE_30_DAYS)

			return reply.status(200).send({
				user: user.user,
				token: {
					accessToken: user.token.accessToken,
				},
			})
		},
	)

	fastify.post<{ Reply: RoleWithToken }>('/refresh-token', async (req, reply) => {
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
}
