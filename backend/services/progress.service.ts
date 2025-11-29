import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Парсит дату из формата ДД/ММ/ГГГГ в Date object
 * @param dateStr - Строка даты в формате ДД/ММ/ГГГГ
 * @returns Date object с временем установленным на начало дня (00:00:00)
 */
export function parseDateString(dateStr: string): Date {
	const [day, month, year] = dateStr.split('/').map(Number)
	const date = new Date(year, month - 1, day)
	// Устанавливаем время на начало дня для корректного сравнения
	date.setHours(0, 0, 0, 0)
	return date
}

/**
 * Проверяет существование отчета о прогрессе за указанную дату для пользователя
 * @param userId - ID пользователя
 * @param date - Дата отчета (Date object)
 * @throws {ApiError} Если отчет за эту дату уже существует
 */
export async function checkReportExists(userId: string, date: Date): Promise<void> {
	const existingReport = await prisma.progress.findFirst({
		where: {
			userId,
			date: {
				gte: date,
				lt: new Date(date.getTime() + 24 * 60 * 60 * 1000), // Следующий день
			},
		},
	})

	if (existingReport) {
		throw ApiError.badRequest('Отчет за эту дату уже существует')
	}
}
