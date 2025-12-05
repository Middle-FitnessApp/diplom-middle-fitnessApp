import { z } from 'zod'
import {
	DEFAULT_PAGE,
	DEFAULT_LIMIT,
	MIN_PAGE,
	MIN_LIMIT,
	MAX_LIMIT,
} from '../../../consts/pagination.js'

/**
 * Схема валидации для GET /api/trainer/clients
 * Query параметры: favorites, search, page, limit
 */
export const GetClientsSchema = z.object({
	favorites: z
		.string()
		.optional()
		.transform((val) => val === 'true')
		.pipe(z.boolean()),
	search: z
		.string({ message: 'Поисковый запрос должен быть строкой' })
		.min(1, { message: 'Поисковый запрос не может быть пустым' })
		.optional(),
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

export type GetClientsDto = z.infer<typeof GetClientsSchema>
