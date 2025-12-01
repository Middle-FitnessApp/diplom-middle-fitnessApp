import { z } from 'zod'
import { DATE_DD_MM_YYYY_REGEX } from '../../../consts/date.js'

// Схема для создания отчета о прогрессе
export const CreateProgressSchema = z.object({
	// Обязательные поля
	date: z
		.string()
		.regex(DATE_DD_MM_YYYY_REGEX, 'Дата должна быть в формате ДД/ММ/ГГГГ')
		.refine(
			(dateStr) => {
				// Парсим дату из формата ДД/ММ/ГГГГ
				const [day, month, year] = dateStr.split('/').map(Number)
				const date = new Date(year, month - 1, day)

				// Проверяем валидность даты (например, 31/02/2024 будет невалидной)
				if (
					date.getDate() !== day ||
					date.getMonth() !== month - 1 ||
					date.getFullYear() !== year
				) {
					return false
				}

				// Проверяем, что дата не в будущем
				const now = new Date()
				now.setHours(23, 59, 59, 999) // Конец текущего дня
				return date <= now
			},
			{
				message: 'Дата должна быть валидной и не может быть в будущем',
			},
		),
	weight: z.number().positive('Вес должен быть положительным числом'),
	waist: z.number().positive('Обхват талии должен быть положительным числом'),
	hips: z.number().positive('Обхват бедер должен быть положительным числом'),

	// Опциональные поля
	height: z.number().positive('Рост должен быть положительным числом').optional(),
	chest: z.number().positive('Обхват груди должен быть положительным числом').optional(),
	arm: z.number().positive('Обхват руки должен быть положительным числом').optional(),
	leg: z.number().positive('Обхват ноги должен быть положительным числом').optional(),
})

export type CreateProgressDTO = z.infer<typeof CreateProgressSchema>
