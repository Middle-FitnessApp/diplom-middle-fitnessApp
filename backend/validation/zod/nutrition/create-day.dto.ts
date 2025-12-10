import { z } from 'zod'

export const CreateNutritionDaySchema = z.object({
	dayTitle: z
		.string()
		.min(1, 'Название дня обязательно')
		.max(100, 'Название дня слишком длинное'),
	dayOrder: z.number().int().min(1, 'Порядок дня должен быть положительным'),
	meals: z
		.array(
			z.object({
				type: z.enum(['BREAKFAST', 'SNACK', 'LUNCH', 'DINNER']),
				name: z
					.string()
					.min(1, 'Название приёма обязательно')
					.max(100, 'Название приёма слишком длинное'),
				mealOrder: z
					.number()
					.int()
					.min(1, 'Порядок приёма должен быть положительным')
					.optional(),
				items: z
					.array(z.string().min(1, 'Элемент не может быть пустым'))
					.min(1, 'Должен быть хотя бы один элемент'),
			}),
		)
		.min(1, 'Должен быть хотя бы один приём пищи'),
})

export type CreateNutritionDayDto = z.infer<typeof CreateNutritionDaySchema>
