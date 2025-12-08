import { z } from 'zod'

/**
 * Схема валидации для GET /api/trainer/clients/:id
 * Параметр ID клиента из URL
 */
export const GetClientProfileParamsSchema = z.object({
	id: z.string({ message: 'ID клиента обязателен' }),
})

export type GetClientProfileParamsDto = z.infer<typeof GetClientProfileParamsSchema>
