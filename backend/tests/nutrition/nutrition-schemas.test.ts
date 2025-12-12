import { describe, it, expect } from 'vitest'
import { CreateNutritionDaySchema } from '../../validation/zod/nutrition/create-day.dto.js'
import { GetClientNutritionPlanQuerySchema } from '../../validation/zod/nutrition/get-client-plan.dto.js'

describe('Схемы валидации питания', () => {
	describe('CreateNutritionDaySchema', () => {
		it('принимает корректный день с приёмами пищи', () => {
			const validData = {
				dayTitle: 'Понедельник',
				dayOrder: 1,
				meals: [
					{
						type: 'BREAKFAST',
						name: 'Омлет',
						mealOrder: 1,
						items: ['Яйца', 'Помидоры'],
					},
					{
						type: 'LUNCH',
						name: 'Суп',
						items: ['Бульон'],
					},
				],
			}

			expect(() => CreateNutritionDaySchema.parse(validData)).not.toThrow()
		})

		it('требует хотя бы один приём пищи', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'Пустой день',
					dayOrder: 1,
					meals: [],
				}),
			).toThrow('Должен быть хотя бы один приём пищи')
		})

		it('требует непустое название дня', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: '',
					dayOrder: 1,
					meals: [{ type: 'BREAKFAST', name: 'Еда', items: ['Что-то'] }],
				}),
			).toThrow('Название дня обязательно')
		})

		it('ограничивает длину названия дня (max 100)', () => {
			const longTitle = 'A'.repeat(101)
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: longTitle,
					dayOrder: 1,
					meals: [{ type: 'BREAKFAST', name: 'Еда', items: ['Что-то'] }],
				}),
			).toThrow('Название дня слишком длинное')
		})

		it('требует dayOrder ≥ 1', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'День',
					dayOrder: 0,
					meals: [{ type: 'BREAKFAST', name: 'Еда', items: ['Что-то'] }],
				}),
			).toThrow('Порядок дня должен быть положительным')
		})

		it('требует корректный тип приёма пищи', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'День',
					dayOrder: 1,
					meals: [{ type: 'DESSERT', name: 'Торт', items: ['Шоколад'] }],
				}),
			).toThrow()
		})

		it('требует непустое название приёма пищи', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'День',
					dayOrder: 1,
					meals: [{ type: 'BREAKFAST', name: '', items: ['Что-то'] }],
				}),
			).toThrow('Название приёма обязательно')
		})

		it('требует хотя бы один элемент в приёме пищи', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'День',
					dayOrder: 1,
					meals: [{ type: 'BREAKFAST', name: 'Еда', items: [] }],
				}),
			).toThrow('Должен быть хотя бы один элемент')
		})

		it('не позволяет элементу быть пустой строкой', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'День',
					dayOrder: 1,
					meals: [{ type: 'BREAKFAST', name: 'Еда', items: [''] }],
				}),
			).toThrow('Элемент не может быть пустым')
		})

		it('делает mealOrder опциональным, но валидным при наличии', () => {
			expect(() =>
				CreateNutritionDaySchema.parse({
					dayTitle: 'День',
					dayOrder: 1,
					meals: [{ type: 'BREAKFAST', name: 'Еда', items: ['Что-то'], mealOrder: 0 }],
				}),
			).toThrow('Порядок приёма должен быть положительным')
		})
	})

	describe('GetClientNutritionPlanQuerySchema', () => {
		it('принимает корректные параметры с датой', () => {
			const result = GetClientNutritionPlanQuerySchema.parse({
				period: 'week',
				date: '2025-12-15',
			})
			expect(result.period).toBe('week')
			expect(result.date).toBe('2025-12-15')
		})

		it('использует период "day" по умолчанию', () => {
			const result = GetClientNutritionPlanQuerySchema.parse({})
			expect(result.period).toBe('day')
		})

		it('проверяет формат даты как YYYY-MM-DD', () => {
			expect(() =>
				GetClientNutritionPlanQuerySchema.parse({ date: '15/12/2025' }),
			).toThrow('Дата должна быть в формате YYYY-MM-DD')

			expect(() =>
				GetClientNutritionPlanQuerySchema.parse({ date: '2025-13-01' }),
			).not.toThrow() // формат OK, валидность даты не проверяется Zod
		})

		it('принимает clientId как опциональную строку', () => {
			const result = GetClientNutritionPlanQuerySchema.parse({ clientId: 'client_123' })
			expect(result.clientId).toBe('client_123')
		})

		it('отклоняет недопустимый период', () => {
			expect(() =>
				GetClientNutritionPlanQuerySchema.parse({ period: 'year' as any }),
			).toThrow()
		})
	})
})
