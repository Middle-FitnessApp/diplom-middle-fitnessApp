import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import { ApiError } from './utils/ApiError.js'
import type { ApiErrorResponse } from './types/error.js'

import authRoutes from './routes/auth.routes.js'

const app = Fastify()

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'Онлайн фитнес-тренер API',
			description: 'API для платформы онлайн фитнес-тренера',
			version: '1.0.0',
		},
	},
})

// Документация будет доступна по /docs
app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
})

app.setErrorHandler((error, request, reply) => {
	if (error instanceof ApiError) {
		const resp: ApiErrorResponse = {
			error: error.message,
			statusCode: error.statusCode,
		}

		return reply.status(error.statusCode).send(resp)
	}

	const resp: ApiErrorResponse = {
		error: 'Внутренняя ошибка сервера',
		statusCode: 500,
	}

	console.error(error)
	return reply.status(500).send(resp)
})

app.register(authRoutes)

export default app
