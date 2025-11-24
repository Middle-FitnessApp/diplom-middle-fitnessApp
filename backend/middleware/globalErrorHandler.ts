import { ApiError } from '../utils/ApiError.js'
import type { FastifyInstance } from 'fastify'

export const errorHandler = (app: FastifyInstance) => {
	app.setErrorHandler((error, request, reply) => {
		// Обработка кастомных ApiError
		if (error instanceof ApiError) {
			return reply.status(error.statusCode).send({
				error: {
					message: error.message,
					statusCode: error.statusCode,
				},
			})
		}

		// Обработка всех остальных ошибок
		console.error(error)
		return reply.status(500).send({
			error: {
				message: 'Внутренняя ошибка сервера',
				statusCode: 500,
			},
		})
	})
}
