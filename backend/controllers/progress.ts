import { prisma } from '../prisma.js'
import { CreateProgressDTO } from '../validation/zod/progress/progress.dto.js'
import { CreateCommentDTO } from '../validation/zod/progress/comment.dto.js'
import { GetProgressCommentsQueryDTO } from '../validation/zod/progress/get-comments.dto.js'
import { GetAllProgressQueryDTO } from '../validation/zod/progress/get-all-progress.dto.js'
import { parseDateString, getDayRange } from '../services/date.service.js'
import { ApiError } from '../utils/ApiError.js'
import type { ChartDataPoint, MetricData, MetricComparison } from '../types/progress.js'

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

	// Находим отчет о прогрессе с комментариями тренера
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
			comments: {
				include: {
					trainer: {
						select: {
							id: true,
							name: true,
							photo: true,
						},
					},
				},
				orderBy: { createdAt: 'desc' },
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
 * Получает все отчеты о прогрессе пользователя с пагинацией и фильтрацией
 * @param userId - ID пользователя
 * @param params - Параметры пагинации и фильтрации
 * @returns Список отчетов с метаданными пагинации
 */
export async function getAllProgress(userId: string, params: GetAllProgressQueryDTO) {
	const { page, limit, startDate, endDate } = params

	// Формируем условие фильтрации по датам
	const dateFilter: { gte?: Date; lte?: Date } = {}
	if (startDate) {
		const start = parseDateString(startDate)
		start.setHours(0, 0, 0, 0)
		dateFilter.gte = start
	}
	if (endDate) {
		const end = parseDateString(endDate)
		end.setHours(23, 59, 59, 999)
		dateFilter.lte = end
	}

	// Формируем where условие
	const where = {
		userId,
		...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
	}

	// Получаем общее количество записей
	const total = await prisma.progress.count({ where })

	console.log('Total progress reports:', total)

	// Вычисляем пагинацию
	const skip = (page - 1) * limit
	const totalPages = Math.ceil(total / limit)

	// Получаем отчеты с пагинацией
	const progress = await prisma.progress.findMany({
		where,
		orderBy: { date: 'desc' },
		skip,
		take: limit,
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
			photoFront: true, // Возвращаем только первое фото
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

	return {
		data: progress,
		meta: {
			page,
			limit,
			total,
			totalPages,
		},
	}
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

/**
 * Получение комментариев к отчету о прогрессе с пагинацией
 * @param progressId - ID отчета о прогрессе
 * @param query - Параметры пагинации (page, limit)
 * @returns Комментарии с метаданными пагинации
 */
export async function getProgressComments(
	progressId: string,
	query: GetProgressCommentsQueryDTO,
) {
	const { ApiError } = await import('../utils/ApiError.js')

	// Проверяем существование отчета о прогрессе
	const progress = await prisma.progress.findUnique({
		where: { id: progressId },
	})

	if (!progress) {
		throw ApiError.notFound('Отчет о прогрессе не найден')
	}

	const { page, limit } = query

	// Вычисляем offset для пагинации
	const skip = (page - 1) * limit
	const take = limit

	// Получаем комментарии с информацией о тренере
	const comments = await prisma.comment.findMany({
		where: { progressId },
		include: {
			trainer: {
				select: {
					id: true,
					name: true,
					email: true,
					photo: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' }, // Сортировка по дате (новые первыми)
		skip,
		take,
	})

	// Получаем общее количество комментариев
	const total = await prisma.comment.count({
		where: { progressId },
	})

	// Вычисляем общее количество страниц
	const totalPages = Math.ceil(total / limit)

	return {
		comments,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	}
}

/**
 * Получение данных аналитики прогресса для графиков
 * @param userId - ID пользователя
 * @param period - Период: 'month', 'year' или 'custom'
 * @param metrics - Массив метрик для анализа
 * @param startDate - Дата начала (обязательна для custom)
 * @param endDate - Дата окончания (обязательна для custom)
 * @returns Агрегированные данные по выбранным метрикам
 */
export async function getProgressAnalytics(
	userId: string,
	period: 'month' | 'year' | 'custom',
	metrics: string[],
	startDate?: string,
	endDate?: string,
) {
	const { ApiError } = await import('../utils/ApiError.js')

	// Определяем диапазон дат в зависимости от периода
	let dateFrom: Date
	let dateTo: Date = new Date()

	if (period === 'custom') {
		if (!startDate || !endDate) {
			throw ApiError.badRequest(
				'Для периода custom необходимо указать startDate и endDate',
			)
		}
		dateFrom = parseDateString(startDate)
		dateTo = parseDateString(endDate)
		// Устанавливаем конец дня для dateTo
		dateTo.setHours(23, 59, 59, 999)
	} else if (period === 'month') {
		dateFrom = new Date()
		dateFrom.setMonth(dateFrom.getMonth() - 1)
		dateFrom.setHours(0, 0, 0, 0)
	} else if (period === 'year') {
		dateFrom = new Date()
		dateFrom.setFullYear(dateFrom.getFullYear() - 1)
		dateFrom.setHours(0, 0, 0, 0)
	} else {
		throw ApiError.badRequest('Неизвестный период')
	}

	// Получаем все отчеты за период
	const progressReports = await prisma.progress.findMany({
		where: {
			userId,
			date: {
				gte: dateFrom,
				lte: dateTo,
			},
		},
		orderBy: { date: 'asc' },
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
		},
	})

	// Формируем данные для графиков
	const analyticsData: MetricData[] = metrics.map((metric) => {
		const dataPoints: ChartDataPoint[] = progressReports.map((report) => ({
			date: report.date.toISOString().split('T')[0], // YYYY-MM-DD
			value: report[metric as keyof typeof report] as number | null,
		}))

		// Фильтруем только не-null значения для расчета статистики
		const validValues = dataPoints
			.map((dp) => dp.value)
			.filter((v): v is number => v !== null)

		const min = validValues.length > 0 ? Math.min(...validValues) : null
		const max = validValues.length > 0 ? Math.max(...validValues) : null
		const avg =
			validValues.length > 0
				? validValues.reduce((sum, val) => sum + val, 0) / validValues.length
				: null

		// Вычисляем изменение (разница между первым и последним)
		const firstValue = validValues[0]
		const lastValue = validValues[validValues.length - 1]
		const change = firstValue && lastValue ? lastValue - firstValue : null

		return {
			metric,
			data: dataPoints,
			min: min !== null ? Math.round(min * 10) / 10 : null,
			max: max !== null ? Math.round(max * 10) / 10 : null,
			avg: avg !== null ? Math.round(avg * 10) / 10 : null,
			change: change !== null ? Math.round(change * 10) / 10 : null,
		}
	})

	return {
		period,
		dateRange: {
			from: dateFrom.toISOString().split('T')[0],
			to: dateTo.toISOString().split('T')[0],
		},
		metrics: analyticsData,
	}
}

/**
 * Сравнение параметров прогресса (начальные vs текущие)
 * @param userId - ID пользователя
 * @param startReportId - ID начального отчета (опционально - берется первый)
 * @param endReportId - ID конечного отчета (опционально - берется последний)
 * @returns Сравнение параметров с расчетом изменений
 */
export async function getProgressComparison(
	userId: string,
	startReportId?: string,
	endReportId?: string,
) {
	const { ApiError } = await import('../utils/ApiError.js')

	// Получаем начальный отчет
	let startReport
	if (startReportId) {
		startReport = await prisma.progress.findUnique({
			where: { id: startReportId },
		})
		if (!startReport || startReport.userId !== userId) {
			throw ApiError.notFound('Начальный отчет не найден')
		}
	} else {
		// Берем самый первый отчет пользователя
		startReport = await prisma.progress.findFirst({
			where: { userId },
			orderBy: { date: 'asc' },
		})
	}

	// Получаем конечный отчет
	let endReport
	if (endReportId) {
		endReport = await prisma.progress.findUnique({
			where: { id: endReportId },
		})
		if (!endReport || endReport.userId !== userId) {
			throw ApiError.notFound('Конечный отчет не найден')
		}
	} else {
		// Берем самый последний отчет пользователя
		endReport = await prisma.progress.findFirst({
			where: { userId },
			orderBy: { date: 'desc' },
		})
	}

	// Проверяем наличие отчетов
	if (!startReport || !endReport) {
		throw ApiError.notFound('Недостаточно данных для сравнения')
	}

	// Проверяем, что это разные отчеты
	if (startReport.id === endReport.id) {
		throw ApiError.badRequest('Нельзя сравнивать отчет с самим собой')
	}

	// Функция для расчета изменения
	const calculateChange = (
		start: number | null,
		end: number | null,
	): {
		absolute: number | null
		percentage: number | null
	} => {
		if (start === null || end === null) {
			return { absolute: null, percentage: null }
		}

		const absolute = end - start
		const percentage = start !== 0 ? (absolute / start) * 100 : null

		return {
			absolute: Math.round(absolute * 10) / 10,
			percentage: percentage !== null ? Math.round(percentage * 10) / 10 : null,
		}
	}

	// Список всех метрик для сравнения
	const metricsToCompare = ['weight', 'height', 'chest', 'waist', 'hips', 'arm', 'leg']

	// Формируем данные сравнения
	const comparisons: MetricComparison[] = metricsToCompare.map((metric) => {
		const startValue = startReport[metric as keyof typeof startReport] as number | null
		const endValue = endReport[metric as keyof typeof endReport] as number | null
		const change = calculateChange(startValue, endValue)

		// Определяем, является ли изменение улучшением
		// Для веса и обхватов - уменьшение это улучшение (кроме роста)
		// Для роста - изменение не оценивается как улучшение/ухудшение
		let improved: boolean | null = null
		if (change.absolute !== null && change.absolute !== 0) {
			if (metric === 'height') {
				improved = null // Рост не оцениваем
			} else {
				improved = change.absolute < 0 // Уменьшение = улучшение
			}
		}

		return {
			metric,
			start: startValue,
			end: endValue,
			change,
			improved,
		}
	})

	// Общая статистика
	const totalMetricsChanged = comparisons.filter(
		(c) => c.change.absolute !== null && c.change.absolute !== 0,
	).length

	const improvedMetrics = comparisons.filter((c) => c.improved === true).length
	const worsenedMetrics = comparisons.filter((c) => c.improved === false).length

	return {
		startReport: {
			id: startReport.id,
			date: startReport.date.toISOString().split('T')[0],
			photoFront: startReport.photoFront,
			photoSide: startReport.photoSide,
			photoBack: startReport.photoBack,
		},
		endReport: {
			id: endReport.id,
			date: endReport.date.toISOString().split('T')[0],
			photoFront: endReport.photoFront,
			photoSide: endReport.photoSide,
			photoBack: endReport.photoBack,
		},
		daysBetween: Math.floor(
			(endReport.date.getTime() - startReport.date.getTime()) / (1000 * 60 * 60 * 24),
		),
		comparisons,
		summary: {
			totalMetricsChanged,
			improvedMetrics,
			worsenedMetrics,
			unchangedMetrics: comparisons.length - totalMetricsChanged,
		},
	}
}
