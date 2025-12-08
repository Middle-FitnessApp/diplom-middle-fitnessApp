import { z } from 'zod'

/**
 * Схема валидации для POST /api/trainer/invites/:id/reject
 * Параметр ID приглашения из URL
 */
export const RejectInviteParamsSchema = z.object({
	id: z.string({ message: 'ID приглашения обязателен' }),
})

export type RejectInviteParamsDto = z.infer<typeof RejectInviteParamsSchema>
