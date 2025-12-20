import { z } from 'zod'
import { Regex } from '../../../consts/regex.js'

/**
 * Схема валидации параметров для отметки уведомления как прочитанного
 */
export const MarkNotificationAsReadParamsSchema = z.object({
	id: z
		.string()
		.min(10, 'ID уведомления должен содержать минимум 10 символов')
		.max(30, 'ID уведомления не может превышать 30 символов')
		.regex(Regex.cuid, 'Некорректный формат ID уведомления'),
})

export type MarkNotificationAsReadParamsDTO = z.infer<
	typeof MarkNotificationAsReadParamsSchema
>
