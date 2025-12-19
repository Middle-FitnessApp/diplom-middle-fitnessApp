import Fastify, { FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import path from 'path'
import sensible from '@fastify/sensible'
import { prisma } from './prisma.js'

import { errorHandler } from './middleware/globalErrorHandler.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import trainerRoutes from './routes/trainer.routes.js'
import nutritionRoutes from './routes/nutrition.routes.js'
import progressRoutes from './routes/progress.routes.js'
import chatRoutes from './routes/chat.routes.js'
import notificationRoutes from './routes/notification.routes.js'

// 👇 Экспортируй функцию создания app
export async function buildApp(): Promise<FastifyInstance> {
	const app = Fastify()

	errorHandler(app)

	app.decorate('prisma', prisma)

	await app.register(sensible)

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

	// Настройка CORS
	app.register(fastifyCors, {
		origin: ['http://localhost:5173', 'https://fitnessapp-result-university.ru'],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	})

	app.register(fastifyCookie, {
		secret: process.env.COOKIE_SECRET,
		parseOptions: {
			httpOnly: true,
			sameSite: 'lax',
		},
	})

	// Маршрут для проверки состояния сервера (для деплоя, не удалять)
	app.get('/health', async () => {
		try {
			await app.prisma.$queryRaw`SELECT 1`

			return {
				status: 'ok',
				db: 'ok',
				uptime: process.uptime(),
				timestamp: Date.now(),
			}
		} catch {
			return app.httpErrors.serviceUnavailable('DB not ready')
		}
	})

	app.register(
		async (instance) => {
			instance.register(authRoutes, { prefix: '/auth' })
			instance.register(userRoutes, { prefix: '/user' })
			instance.register(trainerRoutes, { prefix: '/trainer' })
			instance.register(nutritionRoutes, { prefix: '/nutrition' })
			instance.register(progressRoutes, { prefix: '/progress' })
			instance.register(chatRoutes, { prefix: '/chat' })
			instance.register(notificationRoutes, { prefix: '/notification' })
		},
		{ prefix: '/api' },
	)

	app.register(fastifyStatic, {
		root: path.join(process.cwd(), 'uploads'),
		prefix: '/uploads/',
	})

	return app
}

// 👇 Экспортируй app для продакшн сервера
const app = await buildApp()
export default app
