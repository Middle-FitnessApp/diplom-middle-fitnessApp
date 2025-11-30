import { editClientProfile, editTrainerProfile, getUser } from 'controllers/user.js'
import { createProgress } from 'controllers/progress.js'
import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'

import { authGuard } from 'middleware/authGuard.js'
import { hasRole } from 'middleware/hasRole.js'
import {
	ClientUpdateProfileSchema,
	TrainerUpdateProfileSchema,
} from 'validation/zod/user/update-profile.dto.js'
import { CreateProgressSchema } from 'validation/zod/user/progress.dto.js'
import { MAX_PHOTO_SIZE } from 'consts/file.js'
import {
	cleanupFilesOnError,
	attachFilesToRequest,
	validateRequiredPhotos,
} from 'utils/uploadPhotos.js'

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
				const { uploadPhotos } = await import('utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(req, ['photo'], 500 * 1024)
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
				const { uploadPhotos } = await import('utils/uploadPhotos.js')
				const uploadResult = await uploadPhotos(req, ['photo'], 500 * 1024)
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

	// Получение последнего отчета о прогрессе
	app.get(
		'/progress/latest',
		{ preHandler: [authGuard, hasRole(['CLIENT'])] },
		async (req, reply) => {
			const { getLatestProgress } = await import('controllers/progress.js')
			const { ApiError } = await import('utils/ApiError.js')

			const latestProgress = await getLatestProgress(req.user.id)

			if (!latestProgress) {
				throw ApiError.notFound('Отчеты о прогрессе не найдены')
			}

			return reply.status(200).send({ progress: latestProgress })
		},
	)

	// Создание нового отчета о прогрессе
	app.put(
		'/progress/new-report',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
			onError: cleanupFilesOnError,
		},
		async (req, reply) => {
			// Обрабатываем multipart запрос с тремя обязательными фотографиями
			const { uploadPhotos } = await import('utils/uploadPhotos.js')
			const { ApiError } = await import('utils/ApiError.js')

			const uploadResult = await uploadPhotos(
				req,
				['photoFront', 'photoSide', 'photoBack'],
				MAX_PHOTO_SIZE,
			)

			const { body, files: filesMap } = uploadResult

			// Сохраняем пути загруженных файлов для возможной очистки при ошибке
			attachFilesToRequest(req, filesMap)

			// Проверяем наличие всех трех обязательных фотографий
			validateRequiredPhotos(filesMap, ['photoFront', 'photoSide', 'photoBack'])

			// Проверяем наличие всех обязательных полей
			const requiredFields = [
				'date',
				'weight',
				'height',
				'waist',
				'chest',
				'hips',
				'arm',
				'leg',
			]
			const missingFields = requiredFields.filter((field) => !body[field])

			if (missingFields.length > 0) {
				throw ApiError.badRequest(
					`Отсутствуют обязательные поля: ${missingFields.join(', ')}`,
				)
			}

			// Преобразуем числовые поля из строк в числа
			const numericBody = {
				...body,
				weight: parseFloat(body.weight),
				height: parseFloat(body.height),
				waist: parseFloat(body.waist),
				chest: parseFloat(body.chest),
				hips: parseFloat(body.hips),
				arm: parseFloat(body.arm),
				leg: parseFloat(body.leg),
			}

			// Валидируем данные
			const validatedData = CreateProgressSchema.parse(numericBody)

			// Создаём новый отчёт о прогрессе
			const progress = await createProgress(req.user.id, validatedData, filesMap)

			return reply.status(201).send({
				message: 'Отчет о прогрессе успешно создан',
				progress,
			})
		},
	)

	// Получение конкретного отчета о прогрессе по ID
	app.get(
		'/progress/:id',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { getProgressById } = await import('controllers/progress.js')
			const { ApiError } = await import('utils/ApiError.js')
			const { Regex } = await import('consts/regex.js')
			const { id } = req.params as { id: string }

			// Базовая валидация ID (cuid имеет длину 25 символов и содержит буквы и цифры)
			if (!id || id.length < 10 || !Regex.cuid.test(id)) {
				throw ApiError.badRequest('Некорректный формат ID отчета')
			}

			const progress = await getProgressById(id, req.user.id, req.user.role)

			return reply.status(200).send({ progress })
		},
	)
}
