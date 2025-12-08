import { z } from 'zod'
import { DATE_DD_MM_YYYY_REGEX } from '../../../consts/date.js'

// Допустимые метрики для аналитики
export const MetricEnum = z.enum([
	'weight',
	'waist',
	'hips',
	'height',
	'chest',
	'arm',
	'leg',
])

// Допустимые периоды
export const PeriodEnum = z.enum(['month', 'year', 'custom'])

// Схема для получения аналитики прогресса
export const GetAnalyticsQuerySchema = z
	.object({
		period: PeriodEnum.default('month'),
		metrics: z
			.string()
			.default('weight,waist,hips')
			.transform((val) => val.split(',').map((m) => m.trim()))
			.pipe(z.array(MetricEnum)),
		startDate: z
			.string()
			.regex(DATE_DD_MM_YYYY_REGEX, 'Дата должна быть в формате ДД/ММ/ГГГГ')
			.optional(),
		endDate: z
			.string()
			.regex(DATE_DD_MM_YYYY_REGEX, 'Дата должна быть в формате ДД/ММ/ГГГГ')
			.optional(),
	})
	.refine(
		(data) => {
			// Если период custom, то startDate и endDate обязательны
			if (data.period === 'custom') {
				return data.startDate && data.endDate
			}
			return true
		},
		{
			message: 'Для периода "custom" необходимо указать startDate и endDate',
		},
	)
	.refine(
		(data) => {
			// Проверяем, что endDate >= startDate
			if (data.startDate && data.endDate) {
				const [startDay, startMonth, startYear] = data.startDate.split('/').map(Number)
				const [endDay, endMonth, endYear] = data.endDate.split('/').map(Number)

				const start = new Date(startYear, startMonth - 1, startDay)
				const end = new Date(endYear, endMonth - 1, endDay)

				return end >= start
			}
			return true
		},
		{
			message: 'Дата окончания должна быть позже или равна дате начала',
		},
	)

export type GetAnalyticsQueryDTO = z.infer<typeof GetAnalyticsQuerySchema>
export type MetricType = z.infer<typeof MetricEnum>
export type PeriodType = z.infer<typeof PeriodEnum>
