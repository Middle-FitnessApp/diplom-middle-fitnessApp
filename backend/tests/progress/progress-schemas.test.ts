import { describe, it, expect } from 'vitest'
import { CreateProgressSchema } from '../../validation/zod/progress/progress.dto.js'
import { GetAllProgressQuerySchema } from '../../validation/zod/progress/get-all-progress.dto.js'

describe('Схемы валидации данных прогресса', () => {
	describe('CreateProgressSchema — схема создания отчёта', () => {
		it('принимает корректные данные', () => {
			const data = { date: '10/12/2025', weight: 70, waist: 80, hips: 90 }
			expect(() => CreateProgressSchema.parse(data)).not.toThrow()
		})

		it('требует обязательные поля: date, weight, waist, hips', () => {
			expect(() => CreateProgressSchema.parse({})).toThrow()
			expect(() => CreateProgressSchema.parse({ date: '10/12/2025' })).toThrow()
			expect(() => CreateProgressSchema.parse({ weight: 70 })).toThrow()
		})

		it('отклоняет даты из будущего', () => {
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)
			const futureDate = `${String(tomorrow.getDate()).padStart(2, '0')}/${String(
				tomorrow.getMonth() + 1,
			).padStart(2, '0')}/${tomorrow.getFullYear()}`

			expect(() =>
				CreateProgressSchema.parse({
					date: futureDate,
					weight: 70,
					waist: 80,
					hips: 90,
				}),
			).toThrow('Дата должна быть валидной и не может быть в будущем')
		})

		it('отклоняет невалидные календарные даты (например, 31 февраля)', () => {
			expect(() =>
				CreateProgressSchema.parse({
					date: '31/02/2025',
					weight: 70,
					waist: 80,
					hips: 90,
				}),
			).toThrow('Дата должна быть валидной и не может быть в будущем')
		})

		it('требует положительные числа для всех измерений', () => {
			expect(() =>
				CreateProgressSchema.parse({
					date: '10/12/2025',
					weight: -1,
					waist: 80,
					hips: 90,
				}),
			).toThrow('Вес должен быть положительным числом')

			expect(() =>
				CreateProgressSchema.parse({
					date: '10/12/2025',
					weight: 70,
					waist: 0,
					hips: 90,
				}),
			).toThrow('Обхват талии должен быть положительным числом')
		})
	})

	describe('GetAllProgressQuerySchema — схема запроса списка отчётов', () => {
		it('использует значения по умолчанию для page и limit', () => {
			const result = GetAllProgressQuerySchema.parse({})
			expect(result.page).toBe(1)
			expect(result.limit).toBe(10)
		})

		it('преобразует строковые значения page и limit в числа', () => {
			const result = GetAllProgressQuerySchema.parse({ page: '2', limit: '15' })
			expect(result.page).toBe(2)
			expect(result.limit).toBe(15)
		})

		it('проверяет формат даты (должен быть ДД/ММ/ГГГГ)', () => {
			expect(() => GetAllProgressQuerySchema.parse({ startDate: '2025-12-10' })).toThrow(
				'Дата должна быть в формате ДД/ММ/ГГГГ',
			)

			expect(() => GetAllProgressQuerySchema.parse({ endDate: '10-12-2025' })).toThrow(
				'Дата должна быть в формате ДД/ММ/ГГГГ',
			)
		})

		it('принимает корректные даты в формате ДД/ММ/ГГГГ', () => {
			const result = GetAllProgressQuerySchema.parse({
				startDate: '01/12/2025',
				endDate: '10/12/2025',
			})
			expect(result.startDate).toBe('01/12/2025')
			expect(result.endDate).toBe('10/12/2025')
		})
	})
})
