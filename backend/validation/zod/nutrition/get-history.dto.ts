import { z } from 'zod'

/**
 * Схема валидации для получения истории планов питания
 */
export const GetNutritionHistoryQuerySchema = z.object({
	/**
	 * Номер страницы (начиная с 1)
	 */
	page: z
		.string()
		.optional()
		.default('1')
		.transform((val) => Math.max(1, parseInt(val, 10)))
		.refine((val) => !isNaN(val), { message: 'page должен быть числом' })
		.describe('Номер страницы'),

	/**
	 * Количество элементов на странице (1-100)
	 */
	limit: z
		.string()
		.optional()
		.default('10')
		.transform((val) => Math.min(100, Math.max(1, parseInt(val, 10))))
		.refine((val) => !isNaN(val), { message: 'limit должен быть числом' })
		.describe('Количество элементов на странице'),
})

export type GetNutritionHistoryQuery = z.infer<typeof GetNutritionHistoryQuerySchema>
