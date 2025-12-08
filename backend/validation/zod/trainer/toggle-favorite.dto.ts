import { z } from 'zod'

/**
 * Схема валидации для PUT /api/trainer/clients/:id/favorite
 * Параметр ID клиента из URL
 */
export const ToggleFavoriteParamsSchema = z.object({
	id: z.string({ message: 'ID клиента обязателен' }),
})

export type ToggleFavoriteParamsDto = z.infer<typeof ToggleFavoriteParamsSchema>
