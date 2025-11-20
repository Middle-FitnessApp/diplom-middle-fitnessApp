import { z } from 'zod'

export const loginSchema = {
	body: z.object({
		emailOrPhone: z
			.string()
			.min(3, 'Введите email или телефон'),
		password: z
			.string()
			.min(6, 'Минимальная длина пароля — 6 символов'),
	}),
}

export type LoginDTO = z.infer<typeof loginSchema.body>
