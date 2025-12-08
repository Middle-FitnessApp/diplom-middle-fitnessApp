import { z } from 'zod'
import { Regex } from '../../../consts/regex.js'

/**
 * Схема для назначения плана питания клиенту
 * POST /api/trainer/clients/:id/nutrition
 */
export const AssignMealPlanBodySchema = z.object({
	// ID подкатегории (обязательно)
	subcategoryId: z
		.string()
		.min(10, 'ID подкатегории должен содержать минимум 10 символов')
		.regex(Regex.cuid, 'Некорректный формат ID подкатегории'),

	// Массив ID дней (опционально - если не указан, назначаются все дни из подкатегории)
	dayIds: z
		.array(
			z
				.string()
				.min(10, 'ID дня должен содержать минимум 10 символов')
				.regex(Regex.cuid, 'Некорректный формат ID дня'),
		)
		.optional(),
})

export const AssignMealPlanParamsSchema = z.object({
	id: z
		.string()
		.min(10, 'ID клиента должен содержать минимум 10 символов')
		.regex(Regex.cuid, 'Некорректный формат ID клиента'),
})

export type AssignMealPlanBodyDTO = z.infer<typeof AssignMealPlanBodySchema>
export type AssignMealPlanParamsDTO = z.infer<typeof AssignMealPlanParamsSchema>
