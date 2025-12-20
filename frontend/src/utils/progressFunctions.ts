import type { ProgressReport } from '../store/types/progress.types'

/**
 * Форматирует ISO-дату как DD.MM.YYYY
 */
export const formatDate = (isoDate: string): string => {
	const date = new Date(isoDate)
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	return `${day}.${month}.${year}`
}

/**
 * Форматирует ISO-дату как DD.MM.YYYY HH:mm
 */
export const formatDateTime = (isoDate: string): string => {
	const date = new Date(isoDate)
	const day = String(date.getDate()).padStart(2, '0')
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const year = date.getFullYear()
	const hours = String(date.getHours()).padStart(2, '0')
	const minutes = String(date.getMinutes()).padStart(2, '0')
	return `${day}.${month}.${year} ${hours}:${minutes}`
}

// Типы для computeDiffs
export type MetricKey = 'weight' | 'waist' | 'hips' | 'chest' | 'arm' | 'leg'

export interface MetricDiff {
	key: MetricKey
	label: string
	value: number | undefined
	diff: number | null
}

/**
 * Вычисляет изменения между текущим и предыдущим отчётом
 */
export const computeDiffs = (
	current: ProgressReport,
	prev?: ProgressReport,
): MetricDiff[] => {
	const keys = [
		{ key: 'weight' as MetricKey, label: 'Вес' },
		{ key: 'waist' as MetricKey, label: 'Талия' },
		{ key: 'hips' as MetricKey, label: 'Бёдра' },
		{ key: 'chest' as MetricKey, label: 'Грудь' },
		{ key: 'arm' as MetricKey, label: 'Рука' },
		{ key: 'leg' as MetricKey, label: 'Нога' },
	]

	return keys.map(({ key, label }) => {
		const value = current[key]
		const prevValue = prev ? prev[key] : undefined

		if (prevValue == null || value == null) {
			return { key, label, value, diff: null }
		}

		const diff = Number((value - prevValue).toFixed(1))
		return { key, label, value, diff }
	})
}

/**
 * Опции фильтрации по периоду
 */
export const PERIOD_OPTIONS = [
	{ label: 'Месяц', value: 'month' },
	{ label: 'Год', value: 'year' },
	{ label: 'Все время', value: 'all' },
]

// Экспортируем тип значения периода
export type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']
