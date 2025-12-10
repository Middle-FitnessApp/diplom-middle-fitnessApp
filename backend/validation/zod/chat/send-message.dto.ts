import { z } from 'zod'

export const SendMessageSchemaZod = {
	body: z.object({
		text: z
			.string()
			.min(1, 'Текст сообщения не может быть пустым')
			.max(1000, 'Максимальная длина сообщения — 1000 символов'),
		image: z.string().url('Некорректный URL изображения').optional(),
		chatId: z.string().cuid('Некорректный ID чата').optional(),
	}),
	params: z.object({
		// chatId теперь в body
	}),
}

export type SendMessageDTO = z.infer<typeof SendMessageSchemaZod.body>
export type SendMessageParamsDTO = z.infer<typeof SendMessageSchemaZod.params>
