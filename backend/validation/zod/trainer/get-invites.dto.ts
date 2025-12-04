import { z } from 'zod'
import {
	DEFAULT_PAGE,
	DEFAULT_LIMIT,
	MIN_PAGE,
	MIN_LIMIT,
	MAX_LIMIT,
} from '../../../consts/pagination.js'

/**
 * Схема валидации для GET /api/trainer/invites
 * Query параметры: status, page, limit
 */
export const GetInvitesSchema = z.object({
	status: z
		.enum(['PENDING', 'ACCEPTED', 'REJECTED'], {
			message: 'Статус должен быть PENDING, ACCEPTED или REJECTED',
		})
		.optional()
		.default('PENDING'),
	page: z.coerce
		.number({ message: 'Номер страницы должен быть числом' })
		.int({ message: 'Номер страницы должен быть целым числом' })
		.min(MIN_PAGE, { message: `Номер страницы должен быть >= ${MIN_PAGE}` })
		.optional()
		.default(DEFAULT_PAGE),
	limit: z.coerce
		.number({ message: 'Лимит должен быть числом' })
		.int({ message: 'Лимит должен быть целым числом' })
		.min(MIN_LIMIT, { message: `Лимит должен быть >= ${MIN_LIMIT}` })
		.max(MAX_LIMIT, { message: `Лимит должен быть <= ${MAX_LIMIT}` })
		.optional()
		.default(DEFAULT_LIMIT),
})

export type GetInvitesDto = z.infer<typeof GetInvitesSchema>
