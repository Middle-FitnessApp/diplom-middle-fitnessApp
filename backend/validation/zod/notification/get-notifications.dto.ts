import { z } from 'zod'
import {
	DEFAULT_PAGE,
	DEFAULT_LIMIT,
	MIN_PAGE,
	MIN_LIMIT,
	MAX_LIMIT,
} from '../../../consts/pagination.js'

/**
 * Схема валидации query параметров для получения уведомлений
 */
export const GetNotificationsQuerySchema = z.object({
	page: z
		.string()
		.optional()
		.default(String(DEFAULT_PAGE))
		.transform((val) => parseInt(val, 10))
		.pipe(
			z
				.number()
				.int('Номер страницы должен быть целым числом')
				.min(MIN_PAGE, `Номер страницы должен быть не менее ${MIN_PAGE}`),
		),
	limit: z
		.string()
		.optional()
		.default(String(DEFAULT_LIMIT))
		.transform((val) => parseInt(val, 10))
		.pipe(
			z
				.number()
				.int('Лимит должен быть целым числом')
				.min(MIN_LIMIT, `Лимит должен быть не менее ${MIN_LIMIT}`)
				.max(MAX_LIMIT, `Лимит не может превышать ${MAX_LIMIT}`),
		),
	isRead: z
		.string()
		.optional()
		.transform((val) => {
			if (val === 'true') return true
			if (val === 'false') return false
			return undefined
		}),
})

export type GetNotificationsQueryDTO = z.infer<typeof GetNotificationsQuerySchema>
