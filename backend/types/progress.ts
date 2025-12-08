/**
 * Типы для модуля Progress
 */

/**
 * Точка данных для графика
 */
export interface ChartDataPoint {
	date: string
	value: number | null
}

/**
 * Данные метрики для аналитики
 */
export interface MetricData {
	metric: string
	data: ChartDataPoint[]
	min: number | null
	max: number | null
	avg: number | null
	change: number | null // Изменение от первого до последнего значения
}

/**
 * Сравнение метрики между двумя отчетами
 */
export interface MetricComparison {
	metric: string
	start: number | null
	end: number | null
	change: {
		absolute: number | null
		percentage: number | null
	}
	improved: boolean | null // true - улучшение, false - ухудшение, null - без изменений
}
