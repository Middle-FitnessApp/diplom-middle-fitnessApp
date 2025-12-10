import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'path'
import { Server as SocketIOServer } from 'socket.io'

import { errorHandler } from './middleware/globalErrorHandler.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import trainerRoutes from './routes/trainer.routes.js'
import nutritionRoutes from './routes/nutrition.routes.js'
import progressRoutes from './routes/progress.routes.js'
import chatRoutes from './routes/chat.routes.js'

const app = Fastify()

errorHandler(app)

// Разрешаем пустое тело для application/json
app.addContentTypeParser(
	'application/json',
	{ parseAs: 'string' },
	function (req, body, done) {
		try {
			const json = body === '' ? {} : JSON.parse(body as string)
			done(null, json)
		} catch (err: any) {
			err.statusCode = 400
			done(err, undefined)
		}
	},
)

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
		instance.register(trainerRoutes, { prefix: '/trainer' })
		instance.register(nutritionRoutes, { prefix: '/nutrition' })
		instance.register(progressRoutes, { prefix: '/progress' })
		instance.register(chatRoutes, { prefix: '/chat' })
	},
	{ prefix: '/api' },
)

app.register(fastifyStatic, {
	root: path.join(process.cwd(), 'uploads'),
	prefix: '/uploads/',
})

export default app
