import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'
import { ApiError } from '../utils/ApiError.js'
import type { FastifyInstance } from 'fastify'
import type { ApiErrorResponse } from '../types/error.js'

export const errorHandler = (app: FastifyInstance) => {
	app.setErrorHandler((error, request, reply) => {
		if (hasZodFastifySchemaValidationErrors(error)) {
			const messages = error.validation.map((err) => {
				return { field: err.instancePath.slice(1), massage: err.message }
			})

			return reply.code(400).send({
				error: 'Ошибка валидации',
				message: messages,
				statusCode: 400,
			})
		}

		if (error instanceof ApiError) {
			const resp: ApiErrorResponse = {
				error: error.message,
				statusCode: error.statusCode,
			}
			return reply.status(error.statusCode).send(resp)
		}

		console.error(error)
		return reply.status(500).send({
			error: 'Внутренняя ошибка сервера',
			statusCode: 500,
		})
	})
}
