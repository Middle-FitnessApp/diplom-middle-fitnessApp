import { ApiError } from '../utils/ApiError.js'
import type { FastifyInstance, FastifyError } from 'fastify'
import { ZodError } from 'zod'

export const errorHandler = (app: FastifyInstance) => {
	app.setErrorHandler((error: FastifyError, request, reply) => {
		// Обработка ошибок валидации Zod
		if (error.name === 'ZodError' && 'issues' in error) {
			const zodError = error as unknown as ZodError
			const firstError = zodError.issues[0]

			// Специальная обработка для unrecognized_keys
			if (firstError.code === 'unrecognized_keys') {
				const keys = (firstError as any).keys?.join(', ')
				return reply.status(400).send({
					error: {
						message: `Недопустимые поля: ${keys}`,
						statusCode: 400,
					},
				})
			}

			// Обработка пустого запроса
			if (firstError.code === 'invalid_type') {
				return reply.status(400).send({
					error: {
						message: 'Тело запроса не может быть пустым',
						statusCode: 400,
					},
				})
			}
		}

		// Обработка ошибок парсинга JSON
		if (error.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
			return reply.status(400).send({
				error: {
					message: 'Некорректный JSON в теле запроса',
					statusCode: 400,
				},
			})
		}

		// Обработка ошибок валидации Fastify
		if (error.validation) {
			return reply.status(400).send({
				error: {
					message: error.message || 'Ошибка валидации',
					statusCode: 400,
				},
			})
		}

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
