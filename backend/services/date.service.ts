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
 * Получает диапазон дат для одного дня (начало и конец)
 * @param date - Дата (Date object)
 * @returns Объект с началом и концом дня (start: 00:00:00, end: 23:59:59 следующего дня)
 */
export function getDayRange(date: Date) {
	return {
		start: date,
		end: new Date(date.getTime() + 24 * 60 * 60 * 1000), // Следующий день
	}
}
