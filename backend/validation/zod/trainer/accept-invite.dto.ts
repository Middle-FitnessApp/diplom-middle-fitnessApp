import { z } from 'zod'

/**
 * Схема валидации для POST /api/trainer/invites/:id/accept
 * Параметр ID приглашения из URL
 */
export const AcceptInviteParamsSchema = z.object({
	id: z.string({ message: 'ID приглашения обязателен' }),
})

export type AcceptInviteParamsDto = z.infer<typeof AcceptInviteParamsSchema>
