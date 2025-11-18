import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import authRoutes from './routes/auth.routes'

const app = Fastify()

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: 'Онлайн фитнес-тренер API',
			description: 'API для платформы онлайн фитнес-тренера',
			version: '1.0.0',
		},
	},
	swagger: null, // Используем OpenAPI 3.0
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs', // Документация будет доступна по /docs
});

app.register(authRoutes)

export default app
