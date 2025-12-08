import { z } from 'zod'

/**
 * Схема валидации для DELETE /api/client/invites/:id
 * Параметр ID приглашения из URL
 */
export const CancelInviteParamsSchema = z.object({
	id: z.string({ message: 'ID приглашения обязателен' }),
})

export type CancelInviteParamsDto = z.infer<typeof CancelInviteParamsSchema>
