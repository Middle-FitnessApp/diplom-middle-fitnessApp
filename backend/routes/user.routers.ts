import { editClientProfile, editTrainerProfile, getUser } from 'controllers/user.js'
import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'

import { authGuard } from 'middleware/authGuard.js'
import { hasRole } from 'middleware/hasRole.js'
import {
	ClientUpdateProfileSchema,
	TrainerUpdateProfileSchema,
} from 'validation/zod/user/update-profile.dto.js'

export default async function userRoutes(app: FastifyInstance) {
	app.register(multipart)

	// Получение информации о себе
	app.get(
		'/me',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const user = await getUser(req.user.id)

			return reply.status(200).send({ user })
		},
	)

	// Обновление профиля клиента
	app.put(
		'/client/profile',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
			onError: async (request, reply, error) => {
				// Удаляем загруженные файлы при ошибке
				const uploadedFiles = (request as any).uploadedFiles as string[] | undefined
				if (uploadedFiles && uploadedFiles.length > 0) {
					const { deletePhoto } = await import('utils/uploadPhotos.js')
					uploadedFiles.forEach((filePath) => deletePhoto(filePath))
				}
			},
		},
		async (req, reply) => {
			let body: Record<string, string>
			let filesMap: Record<string, string> = {}

			// Проверяем, является ли запрос multipart (есть ли файлы)
			if (req.isMultipart()) {
				// Обрабатываем загрузку файлов (только основное фото профиля, макс. 500KB)
				const { uploadPhotos } = await import('utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(req, ['photo'], 500 * 1024)
				body = uploadResult.body
				filesMap = uploadResult.files

				// Сохраняем пути загруженных файлов для возможной очистки при ошибке
				const uploadedFiles = Object.values(uploadResult.files)
				Object.assign(req, { uploadedFiles })
			} else {
				// Если нет файлов, просто берём body
				body = (req.body as Record<string, string>) || {}
			}

			// Валидируем данные (globalErrorHandler обработает ошибки)
			const validatedData = ClientUpdateProfileSchema.parse(body) // Обновляем профиль клиента
			const updatedProfile = await editClientProfile(req.user.id, validatedData, filesMap)

			return reply.status(200).send({
				message: 'Профиль клиента успешно обновлён',
				user: updatedProfile,
			})
		},
	)

	// Обновление профиля тренера
	app.put(
		'/trainer/profile',
		{
			preHandler: [authGuard, hasRole(['TRAINER'])],
			onError: async (request, reply, error) => {
				// Удаляем загруженные файлы при ошибке
				const uploadedFiles = (request as any).uploadedFiles as string[] | undefined
				if (uploadedFiles && uploadedFiles.length > 0) {
					const { deletePhoto } = await import('utils/uploadPhotos.js')
					uploadedFiles.forEach((filePath) => deletePhoto(filePath))
				}
			},
		},
		async (req, reply) => {
			let body: Record<string, string>
			let filesMap: Record<string, string> = {}

			// Проверяем, является ли запрос multipart (есть ли файлы)
			if (req.isMultipart()) {
				// Обрабатываем загрузку файлов (только основное фото профиля, макс. 500KB)
				const { uploadPhotos } = await import('utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(req, ['photo'], 500 * 1024)
				body = uploadResult.body
				filesMap = uploadResult.files

				// Сохраняем пути загруженных файлов для возможной очистки при ошибке
				const uploadedFiles = Object.values(uploadResult.files)
				Object.assign(req, { uploadedFiles })
			} else {
				// Если нет файлов, просто берём body
				body = (req.body as Record<string, string>) || {}
			}

			// Валидируем данные (globalErrorHandler обработает ошибки)
			const validatedData = TrainerUpdateProfileSchema.parse(body) // Обновляем профиль тренера
			const updatedProfile = await editTrainerProfile(
				req.user.id,
				validatedData,
				filesMap,
			)

			return reply.status(200).send({
				message: 'Профиль тренера успешно обновлён',
				user: updatedProfile,
			})
		},
	)
}
