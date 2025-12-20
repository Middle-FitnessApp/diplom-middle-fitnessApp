import type { ProgressAnalyticsResponse } from '../store/types/progress.types'

/**
 * Преобразует ответ сервера с аналитикой прогресса
 * в массив данных для графика (LineChart)
 */

export type ChartDataPoint = {
	date: string
	_interpolated?: boolean
	[key: string]: string | number | boolean | undefined
}

export const transformAnalyticsToChartData = (
	analyticsResponse: ProgressAnalyticsResponse,
): ChartDataPoint[] => {
	if (!analyticsResponse?.metrics || analyticsResponse.metrics.length === 0) {
		return []
	}

	const dateMap = new Map<string, ChartDataPoint>()

	analyticsResponse.metrics.forEach((metricData) => {
		metricData.data.forEach((point) => {
			if (!dateMap.has(point.date)) {
				dateMap.set(point.date, { date: point.date })
			}
			const dateEntry = dateMap.get(point.date)!
			dateEntry[metricData.metric] = point.value
		})
	})

	return Array.from(dateMap.values()).sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	)
}
