import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifyCookie from '@fastify/cookie'

import { errorHandler } from 'middleware/globalErrorHandler.js'

import authRoutes from './routes/auth.routes.js'

const app = Fastify({
	ajv: {
		customOptions: {
			removeAdditional: false,
			useDefaults: true,
			coerceTypes: true,
			// Игнорируем неизвестные keywords (OpenAPI расширения)
			strict: false,
		},
	},
})

errorHandler(app)

app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {
		// secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax',
	},
})

app.register(fastifySwagger, {
	mode: 'dynamic',
	openapi: {
		info: {
			title: 'Онлайн фитнес-тренер API',
			description: 'API для платформы онлайн фитнес-тренера',
			version: '1.0.0',
		},
		servers: [
			{
				url: 'http://localhost:3000',
				description: 'Development server',
			},
		],
		tags: [{ name: 'Auth', description: 'Endpoints для аутентификации и авторизации' }],
	},
})

// Документация будет доступна по /docs
app.register(fastifySwaggerUi, {
	routePrefix: '/docs',
})

app.register(authRoutes, { prefix: '/auth' })

export default app
