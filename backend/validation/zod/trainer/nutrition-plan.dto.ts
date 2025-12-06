import { z } from 'zod'

/**
 * Схема валидации параметров URL для отмены плана питания
 */
export const CancelNutritionPlanParamsSchema = z.object({
	clientId: z.string().cuid('clientId должен быть валидным CUID'),
	planId: z.string().cuid('planId должен быть валидным CUID'),
})

export type CancelNutritionPlanParams = z.infer<typeof CancelNutritionPlanParamsSchema>

/**
 * Схема валидации параметров URL для обновления плана питания
 */
export const UpdateNutritionPlanParamsSchema = z.object({
	clientId: z.string().cuid('clientId должен быть валидным CUID'),
	planId: z.string().cuid('planId должен быть валидным CUID'),
})

export type UpdateNutritionPlanParams = z.infer<typeof UpdateNutritionPlanParamsSchema>

/**
 * Схема валидации тела запроса для обновления плана питания
 */
export const UpdateNutritionPlanBodySchema = z
	.object({
		/**
		 * Массив ID дней для назначения (опционально)
		 */
		dayIds: z
			.array(z.string().cuid('Каждый dayId должен быть валидным CUID'))
			.optional()
			.describe('Массив ID дней для назначения'),

		/**
		 * Дата начала плана в формате ISO (опционально)
		 */
		startDate: z
			.string()
			.regex(
				/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
				'startDate должен быть в формате ISO',
			)
			.optional()
			.describe('Дата начала плана'),
	})
	.refine((data) => data.dayIds !== undefined || data.startDate !== undefined, {
		message: 'Необходимо указать хотя бы одно поле для обновления: dayIds или startDate',
	})

export type UpdateNutritionPlanBody = z.infer<typeof UpdateNutritionPlanBodySchema>
