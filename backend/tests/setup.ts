import { beforeEach } from 'vitest'
import { prisma } from './helpers.js' // Используем prisma из helpers
import { execSync } from 'child_process'
import { Prisma } from '@prisma/client'

interface Delegate {
	deleteMany: () => Prisma.PrismaPromise<Prisma.BatchPayload>
}

beforeEach(async () => {
	// Очистка данных перед каждым тестом
	const tables: { name: string; delegate: Delegate }[] = [
		{ name: 'user', delegate: prisma.user },
		{ name: 'refreshToken', delegate: prisma.refreshToken },
		{ name: 'trainerClient', delegate: prisma.trainerClient },
		{ name: 'progress', delegate: prisma.progress },
		{ name: 'comment', delegate: prisma.comment },
		{ name: 'chat', delegate: prisma.chat },
		{ name: 'clientNutritionPlan', delegate: prisma.clientNutritionPlan },
		{ name: 'nutritionMeal', delegate: prisma.nutritionMeal },
		{ name: 'nutritionDay', delegate: prisma.nutritionDay },
		{ name: 'nutritionSubcategory', delegate: prisma.nutritionSubcategory },
		{ name: 'nutritionCategory', delegate: prisma.nutritionCategory },
		{ name: 'message', delegate: prisma.message },
	]

	for (const { name, delegate } of tables) {
		try {
			await delegate.deleteMany()
		} catch (error) {
			console.warn(`Таблица ${name} может не существовать:`, error)
		}
	}
})
