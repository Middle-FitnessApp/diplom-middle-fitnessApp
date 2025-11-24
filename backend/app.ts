import Fastify from 'fastify'
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

app.register(authRoutes, { prefix: '/auth' })

export default app
