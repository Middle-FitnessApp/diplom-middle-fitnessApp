import { z } from 'zod'
import {
	DEFAULT_PAGE,
	MIN_PAGE,
	CHAT_MESSAGES_LIMIT,
	MIN_LIMIT,
	MAX_LIMIT,
} from '../../../consts/pagination.js'

export const GetMessagesSchemaZod = {
	querystring: z.object({
		page: z.coerce.number().int().min(MIN_PAGE).default(DEFAULT_PAGE),
		limit: z.coerce
			.number()
			.int()
			.min(MIN_LIMIT)
			.max(MAX_LIMIT)
			.default(CHAT_MESSAGES_LIMIT),
	}),
	params: z.object({
		chatId: z.string().cuid('Некорректный ID чата'),
	}),
}

export type GetMessagesQueryDTO = z.infer<typeof GetMessagesSchemaZod.querystring>
export type GetMessagesParamsDTO = z.infer<typeof GetMessagesSchemaZod.params>
