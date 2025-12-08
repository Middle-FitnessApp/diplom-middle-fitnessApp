import { editClientProfile, editTrainerProfile, getUser } from '../controllers/user.js'
import {
	inviteTrainer,
	cancelTrainerCooperation,
	cancelInvite,
} from '../controllers/client.js'
import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'

import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import {
	ClientUpdateProfileSchema,
	TrainerUpdateProfileSchema,
} from '../validation/zod/user/update-profile.dto.js'
import { InviteTrainerSchema } from '../validation/zod/client/invite-trainer.dto.js'
import { CancelInviteParamsSchema } from '../validation/zod/client/cancel-invite.dto.js'
import { cleanupFilesOnError, attachFilesToRequest } from '../utils/uploadPhotos.js'

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
			onError: cleanupFilesOnError,
		},
		async (req, reply) => {
			let body: Record<string, string>
			let filesMap: Record<string, string> = {}

			// Проверяем, является ли запрос multipart (есть ли файлы)
			if (req.isMultipart()) {
				// Обрабатываем загрузку файлов (только основное фото профиля, макс. 500KB)
				const { uploadPhotos } = await import('../utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(req, ['photo'], 500 * 1024, 'users')
				body = uploadResult.body
				filesMap = uploadResult.files

				// Сохраняем пути загруженных файлов для возможной очистки при ошибке
				attachFilesToRequest(req, filesMap)
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
			onError: cleanupFilesOnError,
		},
		async (req, reply) => {
			let body: Record<string, string>
			let filesMap: Record<string, string> = {}

			// Проверяем, является ли запрос multipart (есть ли файлы)
			if (req.isMultipart()) {
				// Обрабатываем загрузку файлов (только основное фото профиля, макс. 500KB)
				const { uploadPhotos } = await import('../utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(req, ['photo'], 500 * 1024, 'users')
				body = uploadResult.body
				filesMap = uploadResult.files

				// Сохраняем пути загруженных файлов для возможной очистки при ошибке
				attachFilesToRequest(req, filesMap)
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

	// Отправка приглашения тренеру (только для клиентов)
	app.post(
		'/client/invite-trainer',
		{ preHandler: [authGuard, hasRole(['CLIENT'])] },
		async (req, reply) => {
			const { trainerId } = InviteTrainerSchema.parse(req.body)

			const invite = await inviteTrainer(req.user.id, trainerId)

			return reply.status(201).send({
				message: 'Приглашение отправлено тренеру',
				invite,
			})
		},
	)

	// Отмена сотрудничества с тренером (только для клиентов)
	app.delete(
		'/client/trainer',
		{ preHandler: [authGuard, hasRole(['CLIENT'])] },
		async (req, reply) => {
			const result = await cancelTrainerCooperation(req.user.id)

			return reply.status(200).send(result)
		},
	)

	// Отмена приглашения тренеру (только для клиентов)
	app.delete(
		'/client/invites/:id',
		{ preHandler: [authGuard, hasRole(['CLIENT'])] },
		async (req, reply) => {
			const { id } = CancelInviteParamsSchema.parse(req.params)

			const result = await cancelInvite(req.user.id, id)

			return reply.status(200).send(result)
		},
	)
}
