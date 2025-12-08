import { z } from 'zod'

/**
 * Схема валидации для получения плана питания клиентом
 */
export const GetClientNutritionPlanQuerySchema = z.object({
	/**
	 * Период фильтрации: день, неделя или месяц
	 */
	period: z
		.enum(['day', 'week', 'month'])
		.optional()
		.default('day')
		.describe('Период фильтрации плана'),

	/**
	 * Целевая дата в формате ISO (YYYY-MM-DD)
	 * По умолчанию - сегодня
	 */
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')
		.optional()
		.describe('Целевая дата для расчёта цикла'),
})

export type GetClientNutritionPlanQuery = z.infer<
	typeof GetClientNutritionPlanQuerySchema
>
