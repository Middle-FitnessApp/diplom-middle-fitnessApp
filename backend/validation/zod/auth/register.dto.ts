import { Regex } from 'consts/regex.js'
import { z } from 'zod'
import { registerSchemaSwagger } from '../../../swagger/auth/register.schema.js'

// Базовые обязательные поля для обеих ролей
const baseSchema = z.object({
	name: z.string().min(1, 'Имя обязательно'),
	emailOrPhone: z
		.string()
		.refine(
			(val) => Regex.email.test(val) || Regex.phone.test(val),
			'Введите корректный email или российский номер телефона',
		),
	password: z
		.string()
		.min(5, 'Пароль должен быть минимум 5 символов')
		.max(10, 'Пароль не должен превышать 10 символов'),
})

// Поля для CLIENT
const clientFields = z.object({
	age: z.number().int().positive().optional(),
	weight: z.number().positive().optional(),
	height: z.number().positive().optional(),
	waist: z.number().positive().optional(),
	chest: z.number().positive().optional(),
	hips: z.number().positive().optional(),
	arm: z.number().positive().optional(),
	leg: z.number().positive().optional(),
	goal: z.string().optional(),
	restrictions: z.string().optional(),
	experience: z.string().optional(),
	diet: z.string().optional(),
	photoFront: z.string().url().optional(),
	photoSide: z.string().url().optional(),
	photoBack: z.string().url().optional(),
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

// Zod схемы для валидации (используются в коде)
export const registerSchemaZod = {
	querystring: z.object({
		role: z.enum(['CLIENT', 'TRAINER']),
	}),
	body: baseSchema.merge(clientFields).merge(trainerFields),
}

// Схема для Swagger документации (красивые описания)
export const registerSchema = registerSchemaSwagger

// Функция для получения правильной схемы в зависимости от роли
export function getRegisterBodySchema(role: 'CLIENT' | 'TRAINER') {
	return role === 'CLIENT' ? clientBodySchema : trainerBodySchema
}

export type RegisterDTO = z.infer<typeof registerSchemaZod.body>
export type RegisterQuery = z.infer<typeof registerSchemaZod.querystring>
export type ClientRegisterDTO = z.infer<typeof clientBodySchema>
export type TrainerRegisterDTO = z.infer<typeof trainerBodySchema>
