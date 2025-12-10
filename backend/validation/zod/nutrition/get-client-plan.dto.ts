import { z } from 'zod'

/**
 * Схема валидации для получения плана питания клиентом или тренером
 */
export const GetClientNutritionPlanQuerySchema = z.object({
	/**
	 * ID клиента (только для тренера)
	 */
	clientId: z.string().optional().describe('ID клиента для тренера'),

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
