/**
 * Утилиты для работы с циклическими планами питания
 */

/**
 * Вычисляет индекс текущего дня в цикле на основе startDate
 * @param startDate - Дата начала плана
 * @param totalDays - Общее количество дней в цикле
 * @param targetDate - Целевая дата (по умолчанию - сегодня)
 * @returns Индекс дня в цикле (0-based)
 */
export function getCurrentDayIndex(
	startDate: Date,
	totalDays: number,
	targetDate: Date = new Date(),
): number {
	// Нормализуем даты до начала дня (убираем время)
	const start = new Date(startDate)
	start.setHours(0, 0, 0, 0)

	const target = new Date(targetDate)
	target.setHours(0, 0, 0, 0)

	// Вычисляем количество дней между датами
	const diffInMs = target.getTime() - start.getTime()
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

	// Если targetDate раньше startDate, возвращаем 0
	if (diffInDays < 0) {
		return 0
	}

	// Возвращаем остаток от деления на количество дней (циклический индекс)
	return diffInDays % totalDays
}

/**
 * Генерирует массив дней цикла с датами для указанного периода
 * @param startDate - Дата начала плана
 * @param days - Массив дней из базы данных
 * @param period - Период фильтрации: 'day' | 'week' | 'month'
 * @param targetDate - Целевая дата (по умолчанию - сегодня)
 * @returns Массив дней с рассчитанными датами
 */
export function calculateCycleDays<
	T extends { id: string; dayTitle: string; dayOrder: number },
>(
	startDate: Date,
	days: T[],
	period: 'day' | 'week' | 'month',
	targetDate: Date = new Date(),
): Array<T & { date: string; isToday: boolean }> {
	const totalDays = days.length

	if (totalDays === 0) {
		return []
	}

	// Сортируем дни по dayOrder
	const sortedDays = [...days].sort((a, b) => a.dayOrder - b.dayOrder)

	// Определяем количество дней для отображения
	let daysToShow: number
	switch (period) {
		case 'day':
			daysToShow = 1
			break
		case 'week':
			daysToShow = 7
			break
		case 'month':
			daysToShow = Math.min(31, totalDays)
			break
		default:
			daysToShow = 1
	}

	// Получаем текущий индекс в цикле
	const currentIndex = getCurrentDayIndex(startDate, totalDays, targetDate)

	// Нормализуем targetDate
	const target = new Date(targetDate)
	target.setHours(0, 0, 0, 0)

	const result: Array<T & { date: string; isToday: boolean }> = []

	// Генерируем дни начиная с текущего
	for (let i = 0; i < daysToShow; i++) {
		// Вычисляем индекс дня в цикле
		const cycleIndex = (currentIndex + i) % totalDays
		const day = sortedDays[cycleIndex]

		// Вычисляем дату для этого дня
		const date = new Date(target)
		date.setDate(target.getDate() + i)

		result.push({
			...day,
			date: date.toISOString().split('T')[0], // YYYY-MM-DD
			isToday: i === 0,
		})
	}

	return result
}

/**
 * Вычисляет дату для конкретного дня в цикле
 * @param startDate - Дата начала плана
 * @param dayOrder - Порядковый номер дня в плане (1-based)
 * @param totalDays - Общее количество дней в цикле
 * @param targetDate - Целевая дата (по умолчанию - сегодня)
 * @returns Дата, когда этот день будет актуален
 */
export function getDateForDay(
	startDate: Date,
	dayOrder: number,
	totalDays: number,
	targetDate: Date = new Date(),
): Date {
	const currentIndex = getCurrentDayIndex(startDate, totalDays, targetDate)
	const dayIndex = dayOrder - 1 // Переводим в 0-based

	// Нормализуем targetDate
	const target = new Date(targetDate)
	target.setHours(0, 0, 0, 0)

	// Если искомый день впереди в текущем цикле
	if (dayIndex >= currentIndex) {
		const daysAhead = dayIndex - currentIndex
		const result = new Date(target)
		result.setDate(target.getDate() + daysAhead)
		return result
	}

	// Если искомый день позади, берём из следующего цикла
	const daysAhead = totalDays - currentIndex + dayIndex
	const result = new Date(target)
	result.setDate(target.getDate() + daysAhead)
	return result
}
