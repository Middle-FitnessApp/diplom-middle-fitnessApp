import { Regex } from '../../../consts/regex.js'
import type { UserRole } from '@prisma/client'
import { CLIENT } from '../../../consts/role.js'
import { z } from 'zod'

// Базовые обязательные поля для обеих ролей
const baseSchema = z.object({
	name: z.string({ message: 'Имя обязательно' }).min(1, 'Имя обязательно'),
	emailOrPhone: z
		.string({ message: 'Email или телефон обязателен' })
		.refine(
			(val) => Regex.email.test(val) || Regex.phone.test(val),
			'Введите корректный email или российский номер телефона',
		),
	password: z
		.string({ message: 'Пароль обязателен' })
		.min(1, 'Пароль обязателен')
		.refine((val) => val.length >= 5, 'Пароль должен быть минимум 5 символов')
		.refine((val) => val.length <= 10, 'Пароль не должен превышать 10 символов'),
	age: z.coerce
		.number({ message: 'Возраст обязателен' })
		.int()
		.positive('Возраст должен быть положительным'),
})

// Поля для CLIENT
const clientFields = z.object({
	weight: z.coerce
		.number({ message: 'Вес обязателен' })
		.positive('Вес должен быть положительным'),
	height: z.coerce
		.number({ message: 'Рост обязателен' })
		.positive('Рост должен быть положительным'),
	waist: z.coerce
		.number({ message: 'Обхват талии обязателен' })
		.positive('Обхват талии должен быть положительным'),
	chest: z.coerce
		.number({ message: 'Обхват груди обязателен' })
		.positive('Обхват груди должен быть положительным'),
	hips: z.coerce
		.number({ message: 'Обхват бёдер обязателен' })
		.positive('Обхват бёдер должен быть положительным'),
	arm: z.coerce
		.number({ message: 'Обхват руки обязателен' })
		.positive('Обхват руки должен быть положительным'),
	leg: z.coerce
		.number({ message: 'Обхват ноги обязателен' })
		.positive('Обхват ноги должен быть положительным'),
	goal: z.string({ message: 'Цель обязательна' }).min(1, 'Цель обязательна'),
	restrictions: z
		.string({ message: 'Ограничения обязательны' })
		.min(1, 'Ограничения обязательны'),
	experience: z.string({ message: 'Опыт обязателен' }).min(1, 'Опыт обязателен'),
	diet: z.string({ message: 'Диета обязательна' }).min(1, 'Диета обязательна'),
})

// Поля для TRAINER
const trainerFields = z.object({
	telegram: z.string().optional(),
	whatsapp: z.string().optional(),
	instagram: z.string().optional(),
	bio: z.string().max(500, 'Bio слишком длинное').optional(),
})

// Схемы для каждой роли
const clientBodySchema = baseSchema.merge(clientFields)
const trainerBodySchema = baseSchema.merge(trainerFields)

// Querystring схема для роли
export const registerQuerySchema = z.object({
	role: z.enum(['CLIENT', 'TRAINER']).optional().default(CLIENT),
})

// Функция для получения правильной схемы в зависимости от роли
export function getRegisterBodySchema(role: UserRole) {
	return role === CLIENT ? clientBodySchema : trainerBodySchema
}

export type ClientRegisterDTO = z.infer<typeof clientBodySchema>
export type TrainerRegisterDTO = z.infer<typeof trainerBodySchema>
