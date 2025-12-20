import { z } from 'zod'
import { DATE_DD_MM_YYYY_REGEX } from '../../../consts/date.js'
import {
	DEFAULT_PAGE,
	DEFAULT_LIMIT,
	MIN_PAGE,
	MIN_LIMIT,
	MAX_LIMIT,
} from '../../../consts/pagination.js'

// Схема для получения всех отчетов с пагинацией и фильтрацией
export const GetAllProgressQuerySchema = z.object({
	// Пагинация
	page: z
		.string()
		.optional()
		.default(String(DEFAULT_PAGE))
		.transform((val) => parseInt(val, 10))
		.pipe(
			z.number().min(MIN_PAGE, { message: `Номер страницы должен быть >= ${MIN_PAGE}` }),
		),
	limit: z
		.string()
		.optional()
		.default(String(DEFAULT_LIMIT))
		.transform((val) => parseInt(val, 10))
		.pipe(
			z
				.number()
				.min(0, { message: `Количество элементов должно быть >= 0 (0 = все записи)` })
				.max(MAX_LIMIT, { message: `Максимум ${MAX_LIMIT} элементов на странице` }),
		),
	// Фильтрация по дате
	startDate: z
		.string()
		.regex(DATE_DD_MM_YYYY_REGEX, 'Дата должна быть в формате ДД/ММ/ГГГГ')
		.optional(),
	endDate: z
		.string()
		.regex(DATE_DD_MM_YYYY_REGEX, 'Дата должна быть в формате ДД/ММ/ГГГГ')
		.optional(),
})

export type GetAllProgressQueryDTO = z.infer<typeof GetAllProgressQuerySchema>
