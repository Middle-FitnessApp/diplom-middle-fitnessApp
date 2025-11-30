import { z } from 'zod'
import type { UserRole } from '@prisma/client'
import { CLIENT } from '../../../consts/role.js'
import { Regex } from '../../../consts/regex.js'

// Общие поля для всех пользователей (обновляемые)
const commonFields = {
	name: z
		.string({ message: 'Имя обязательно' })
		.min(1, 'Имя не может быть пустым')
		.optional(),
	age: z.coerce
		.number({ message: 'Возраст обязателен' })
		.int()
		.positive('Возраст должен быть положительным')
		.optional(),
	email: z
		.string({ message: 'Email должен быть строкой' })
		.refine((val) => Regex.email.test(val), 'Введите корректный email')
		.optional(),
	phone: z
		.string({ message: 'Телефон должен быть строкой' })
		.refine(
			(val) => Regex.phone.test(val),
			'Введите корректный российский номер телефона',
		)
		.optional(),
	photo: z.string().optional(),
}

// Поля для тренера (обновляемые)
const trainerFields = {
	telegram: z.string().optional(),
	whatsapp: z.string().optional(),
	instagram: z.string().optional(),
	bio: z.string().max(500, 'Bio не должно превышать 500 символов').optional(),
}

// Схема для обновления профиля клиента
export const ClientUpdateProfileSchema = z
	.object({
		...commonFields,
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: 'Тело запроса не может быть пустым',
	})

// Схема для обновления профиля тренера
export const TrainerUpdateProfileSchema = z
	.object({
		...commonFields,
		...trainerFields,
	})
	.strict()
	.refine((data) => Object.keys(data).length > 0, {
		message: 'Тело запроса не может быть пустым',
	})

export type ClientUpdateProfileDTO = z.infer<typeof ClientUpdateProfileSchema>
export type TrainerUpdateProfileDTO = z.infer<typeof TrainerUpdateProfileSchema>
