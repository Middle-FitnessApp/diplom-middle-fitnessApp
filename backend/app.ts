import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'path'

import { errorHandler } from 'middleware/globalErrorHandler.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from 'routes/user.routers.js'

const app = Fastify()

errorHandler(app)

app.register(fastifyCors, {
	origin: process.env.FRONTEND_URL || 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
})

app.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	parseOptions: {
		// secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax',
	},
})

app.register(
	async (instance) => {
		instance.register(authRoutes, { prefix: '/auth' })
		instance.register(userRoutes, { prefix: '/user' })
	},
	{ prefix: '/api' },
)

app.register(fastifyStatic, {
	root: path.join(process.cwd(), 'uploads'),
	prefix: '/uploads/',
})

export default app
