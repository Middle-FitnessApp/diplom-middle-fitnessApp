import { prisma } from '../prisma.js'
import { CreateProgressDTO } from '../validation/zod/progress/progress.dto.js'
import { CreateCommentDTO } from '../validation/zod/progress/comment.dto.js'
import { parseDateString, getDayRange } from '../services/date.service.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Создание нового отчета о прогрессе
 * @param userId - ID пользователя
 * @param data - Данные отчета (измерения и дата)
 * @param filesMap - Объект с путями к загруженным фотографиями
 * @returns Созданный отчет о прогрессе
 */
export async function createProgress(
	userId: string,
	data: CreateProgressDTO,
	filesMap: Record<string, string>,
) {
	// Парсим дату из формата ДД/ММ/ГГГГ
	const reportDate = parseDateString(data.date)

	// Проверяем, существует ли уже отчет за эту дату
	const dateRange = getDayRange(reportDate)
	const existingReport = await prisma.progress.findFirst({
		where: {
			userId,
			date: {
				gte: dateRange.start,
				lt: dateRange.end,
			},
		},
	})

	if (existingReport) {
		throw ApiError.badRequest('Отчет за эту дату уже существует')
	}

	// Создаем новый отчет о прогрессе
	const progress = await prisma.progress.create({
		data: {
			userId,
			date: reportDate,
			// Обязательные поля
			weight: data.weight,
			waist: data.waist,
			hips: data.hips,
			// Опциональные поля
			...(data.height !== undefined && { height: data.height }),
			...(data.chest !== undefined && { chest: data.chest }),
			...(data.arm !== undefined && { arm: data.arm }),
			...(data.leg !== undefined && { leg: data.leg }),
			// Фото (опциональные)
			...(filesMap.photoFront && { photoFront: filesMap.photoFront }),
			...(filesMap.photoSide && { photoSide: filesMap.photoSide }),
			...(filesMap.photoBack && { photoBack: filesMap.photoBack }),
		},
	})

	return progress
}

/**
 * Получает последний отчет о прогрессе для пользователя
 * @param userId - ID пользователя
 * @returns Последний отчет о прогрессе или null, если отчетов нет
 */
export async function getLatestProgress(userId: string) {
	return await prisma.progress.findFirst({
		where: { userId },
		orderBy: { createdAt: 'desc' },
		select: {
			id: true,
			date: true,
			weight: true,
			height: true,
			chest: true,
			waist: true,
			hips: true,
			arm: true,
			leg: true,
			photoFront: true,
			photoSide: true,
			photoBack: true,
			createdAt: true,
			updatedAt: true,
		},
	})
}

/**
 * Получает конкретный отчет о прогрессе по ID
 * @param progressId - ID отчета
 * @param userId - ID пользователя
 * @param userRole - Роль пользователя
 * @returns Отчет о прогрессе с полной информацией
 */
export async function getProgressById(
	progressId: string,
	userId: string,
	userRole: 'CLIENT' | 'TRAINER',
) {
	const { ApiError } = await import('../utils/ApiError.js')

	// Находим отчет о прогрессе
	const progress = await prisma.progress.findUnique({
		where: { id: progressId },
		include: {
			user: {
				select: {
					id: true,
					name: true,
					photo: true,
				},
			},
		},
	})

	// Проверяем существование отчета
	if (!progress) {
		throw ApiError.notFound('Отчет о прогрессе не найден')
	}

	// Проверка прав доступа:
	// - Клиент может видеть только свои отчеты
	// - Тренер может видеть все отчеты (в будущем добавим проверку связи клиент-тренер)
	if (userRole === 'CLIENT' && progress.userId !== userId) {
		throw ApiError.forbidden('Нет доступа к этому отчету')
	}

	return progress
}

/**
 * Получает все отчеты о прогрессе пользователя
 * @param userId - ID пользователя
 * @returns Список всех отчетов о прогрессе
 */
export async function getAllProgress(userId: string) {
	const progress = await prisma.progress.findMany({
		where: { userId },
		orderBy: { date: 'desc' },
		select: {
			id: true,
			date: true,
			weight: true,
			height: true,
			chest: true,
			waist: true,
			hips: true,
			arm: true,
			leg: true,
			photoFront: true,
			photoSide: true,
			photoBack: true,
			createdAt: true,
			updatedAt: true,
			comments: {
				select: {
					id: true,
					text: true,
					createdAt: true,
					trainer: {
						select: {
							id: true,
							name: true,
							photo: true,
						},
					},
				},
			},
		},
	})
	return progress || []
}

/**
 * Добавление комментария тренером к отчету о прогрессе
 * @param progressId - ID отчета о прогрессе
 * @param trainerId - ID тренера
 * @param data - Данные комментария
 * @returns Созданный комментарий
 */
export async function addComment(
	progressId: string,
	trainerId: string,
	data: CreateCommentDTO,
) {
	const { ApiError } = await import('../utils/ApiError.js')

	// Проверяем существование отчета о прогрессе
	const progress = await prisma.progress.findUnique({
		where: { id: progressId },
	})

	if (!progress) {
		throw ApiError.notFound('Отчет о прогрессе не найден')
	}

	// Создаем комментарий
	const comment = await prisma.comment.create({
		data: {
			text: data.text,
			progressId,
			trainerId,
		},
		include: {
			trainer: {
				select: {
					id: true,
					name: true,
					photo: true,
				},
			},
		},
	})

	return comment
}
