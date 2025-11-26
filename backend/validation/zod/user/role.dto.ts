import { z } from 'zod'

export const roleSchema = z.object({
	role: z.enum(['CLIENT', 'TRAINER'], {
		message: 'Неверная роль. Допустимые значения: CLIENT, TRAINER',
	}),
})

export type RoleDTO = z.infer<typeof roleSchema>
