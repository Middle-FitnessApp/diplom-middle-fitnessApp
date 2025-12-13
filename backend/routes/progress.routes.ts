import { createProgress } from '../controllers/progress.js'
import { FastifyInstance } from 'fastify'
import multipart from '@fastify/multipart'

import { authGuard } from '../middleware/authGuard.js'
import { hasRole } from '../middleware/hasRole.js'
import { CreateProgressSchema } from '../validation/zod/progress/progress.dto.js'
import { CreateCommentSchema } from '../validation/zod/progress/comment.dto.js'
import { GetProgressCommentsQuerySchema } from '../validation/zod/progress/get-comments.dto.js'
import { GetAllProgressQuerySchema } from '../validation/zod/progress/get-all-progress.dto.js'
import { GetAnalyticsQuerySchema } from '../validation/zod/progress/analytics.dto.js'
import { GetComparisonQuerySchema } from '../validation/zod/progress/compare.dto.js'
import { MAX_PHOTO_SIZE } from '../consts/file.js'
import { cleanupFilesOnError, attachFilesToRequest } from '../utils/uploadPhotos.js'

export default async function progressRoutes(app: FastifyInstance) {
	// Регистрируем multipart, но он будет работать только для multipart/form-data
	app.register(multipart)

	// Получение последнего отчета о прогрессе
	app.get(
		'/latest',
		{ preHandler: [authGuard, hasRole(['CLIENT'])] },
		async (req, reply) => {
			const { getLatestProgress } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')

			const latestProgress = await getLatestProgress(req.user.id)

			if (!latestProgress) {
				throw ApiError.notFound('Отчеты о прогрессе не найдены')
			}

			return reply.status(200).send({ progress: latestProgress })
		},
	)

	// Создание нового отчета о прогрессе
	app.put(
		'/new-report',
		{
			preHandler: [authGuard, hasRole(['CLIENT'])],
			onError: cleanupFilesOnError,
		},
		async (req, reply) => {
			// Обрабатываем multipart запрос с опциональными фотографиями
			const { uploadPhotos } = await import('../utils/uploadPhotos.js')
			const { ApiError } = await import('../utils/ApiError.js')

			const uploadResult = await uploadPhotos(
				req,
				['photoFront', 'photoSide', 'photoBack'],
				MAX_PHOTO_SIZE,
				'progress', // Сохраняем фото прогресса в отдельную подпапку
			)

			const { body, files: filesMap } = uploadResult

			// Сохраняем пути загруженных файлов для возможной очистки при ошибке
			attachFilesToRequest(req, filesMap)

			// Проверяем наличие ОБЯЗАТЕЛЬНЫХ полей (согласно Zod схеме)
			const requiredFields = ['date', 'weight', 'waist', 'hips']
			const missingFields = requiredFields.filter((field) => !body[field])

			if (missingFields.length > 0) {
				throw ApiError.badRequest(
					`Отсутствуют обязательные поля: ${missingFields.join(', ')}`,
				)
			}

			// Преобразуем числовые поля из строк в числа
			// Обязательные поля
			const numericBody: Record<string, any> = {
				date: body.date,
				weight: parseFloat(body.weight),
				waist: parseFloat(body.waist),
				hips: parseFloat(body.hips),
			}

			// Опциональные поля - добавляем только если они есть
			if (body.height) numericBody.height = parseFloat(body.height)
			if (body.chest) numericBody.chest = parseFloat(body.chest)
			if (body.arm) numericBody.arm = parseFloat(body.arm)
			if (body.leg) numericBody.leg = parseFloat(body.leg)

			// Валидируем данные через Zod схему
			const validatedData = CreateProgressSchema.parse(numericBody)

			// Создаём новый отчёт о прогрессе (фото опциональны)
			const progress = await createProgress(req.user.id, validatedData, filesMap)

			const trainerId = await getTrainerForClient(req.user.id)
			if (trainerId && app.io) {
				console.log('Creating notification for trainerId:', trainerId)
				await createNotification(
					trainerId,
					'REPORT',
					`Ваш клиент отправил новый отчет о прогрессе`,
					app.io,
				)
			}

			return reply.status(201).send({
				message: 'Отчет о прогрессе успешно создан',
				progress,
			})
		},
	)

	// Получение аналитики прогресса для графиков
	app.get(
		'/analytics',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { getProgressAnalytics } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')

			// Валидация query параметров
			const validation = GetAnalyticsQuerySchema.safeParse(req.query)

			if (!validation.success) {
				const firstError = validation.error.issues[0]
				throw ApiError.badRequest(firstError.message)
			}

			const { period, metrics, startDate, endDate } = validation.data

			// Для клиента - получаем его данные, для тренера - нужно указать clientId в query
			let userId = req.user.id
			if (req.user.role === 'TRAINER') {
				// Тренер должен указать clientId в query параметрах
				const { clientId } = req.query as { clientId?: string }
				if (!clientId) {
					throw ApiError.badRequest('Тренер должен указать clientId в query параметрах')
				}
				userId = clientId
			}

			// Получение аналитики
			const analytics = await getProgressAnalytics(
				userId,
				period,
				metrics,
				startDate,
				endDate,
			)

			return reply.status(200).send(analytics)
		},
	)

	// Сравнение параметров прогресса (начальные vs текущие)
	app.get(
		'/compare',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { getProgressComparison } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')

			// Валидация query параметров
			const validation = GetComparisonQuerySchema.safeParse(req.query)

			if (!validation.success) {
				const firstError = validation.error.issues[0]
				throw ApiError.badRequest(firstError.message)
			}

			const { startReportId, endReportId } = validation.data

			// Для клиента - сравниваем его данные, для тренера - нужно указать clientId
			let userId = req.user.id
			if (req.user.role === 'TRAINER') {
				const { clientId } = req.query as { clientId?: string }
				if (!clientId) {
					throw ApiError.badRequest('Тренер должен указать clientId в query параметрах')
				}
				userId = clientId
			}

			// Получение сравнения
			const comparison = await getProgressComparison(userId, startReportId, endReportId)

			return reply.status(200).send(comparison)
		},
	)

	// Получение конкретного отчета о прогрессе по ID
	app.get(
		'/:id',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { getProgressById } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')
			const { Regex } = await import('../consts/regex.js')
			const { id } = req.params as { id: string }

			// Базовая валидация ID (cuid имеет длину 25 символов и содержит буквы и цифры)
			if (!id || id.length < 10 || !Regex.cuid.test(id)) {
				throw ApiError.badRequest('Некорректный формат ID отчета')
			}

			const progress = await getProgressById(id, req.user.id, req.user.role)

			return reply.status(200).send({ progress })
		},
	)

	// Получение ВСЕХ отчетов прогресса пользователя с пагинацией и фильтрацией
	app.get(
		'/',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { getAllProgress } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')
			const { PrismaClient } = await import('@prisma/client')
			const prisma = new PrismaClient()

			// Валидация query параметров
			const validation = GetAllProgressQuerySchema.safeParse(req.query)
			if (!validation.success) {
				const firstError = validation.error.issues[0]
				throw ApiError.badRequest(firstError.message)
			}

			let userId = req.user.id

			// Для тренера - получаем отчеты клиента
			if (req.user.role === 'TRAINER') {
				const { clientId } = req.query as { clientId?: string }
				if (!clientId) {
					throw ApiError.badRequest('Тренер должен указать clientId в query параметрах')
				}

				// Проверяем, что клиент связан с тренером и статус ACCEPTED
				const trainerClient = await prisma.trainerClient.findFirst({
					where: {
						trainerId: req.user.id,
						clientId: clientId,
						status: 'ACCEPTED',
					},
				})

				if (!trainerClient) {
					throw ApiError.forbidden('У вас нет доступа к отчетам этого клиента')
				}

				userId = clientId
			}

			const result = await getAllProgress(userId, validation.data)
			return reply.status(200).send(result)
		},
	)

	// Получение комментариев к отчету о прогрессе
	app.get(
		'/:id/comments',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { getProgressComments } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')
			const { Regex } = await import('../consts/regex.js')
			const { id } = req.params as { id: string }

			// Валидация ID отчета
			if (!id || id.length < 10 || !Regex.cuid.test(id)) {
				throw ApiError.badRequest('Некорректный формат ID отчета')
			}

			// Валидация query параметров
			const validation = GetProgressCommentsQuerySchema.safeParse(req.query)

			if (!validation.success) {
				const firstError = validation.error.issues[0]
				throw ApiError.badRequest(firstError.message)
			}

			// Получение комментариев
			const result = await getProgressComments(id, validation.data)

			return reply.status(200).send(result)
		},
	)

	// Добавление комментария тренером к отчету о прогрессе
	app.post(
		'/:id/comments',
		{ preHandler: [authGuard, hasRole(['TRAINER'])] },
		async (req, reply) => {
			const { addComment } = await import('../controllers/progress.js')
			const { ApiError } = await import('../utils/ApiError.js')
			const { Regex } = await import('../consts/regex.js')
			const { id } = req.params as { id: string }

			// Валидация ID отчета
			if (!id || id.length < 10 || !Regex.cuid.test(id)) {
				throw ApiError.badRequest('Некорректный формат ID отчета')
			}

			// Если body - строка (multipart обработал как текст), парсим JSON
			let bodyData = req.body
			if (typeof req.body === 'string') {
				try {
					bodyData = JSON.parse(req.body)
				} catch {
					throw ApiError.badRequest('Некорректный JSON в теле запроса')
				}
			}

			// Валидация данных комментария
			const validation = CreateCommentSchema.safeParse(bodyData)

			if (!validation.success) {
				const firstError = validation.error.issues[0]
				throw ApiError.badRequest(firstError.message)
			}

			// Создание комментария
			const comment = await addComment(id, req.user.id, validation.data)

			// Отправляем уведомление клиенту о новом комментарии
			const { createNotification } = await import('../services/notification.service.js')
			const { prisma } = await import('../prisma.js')

			// Получаем ID клиента из отчета о прогрессе
			const progress = await prisma.progress.findUnique({
				where: { id },
				select: { userId: true },
			})

			if (progress && app.io) {
				await createNotification(
					progress.userId,
					'COMMENT',
					`Тренер добавил комментарий к вашему отчету о прогрессе`,
					app.io,
				)
			}

			return reply.status(201).send({
				message: 'Комментарий успешно добавлен',
				comment,
			})
		},
	)
}
