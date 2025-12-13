import { beforeAll, afterAll, beforeEach } from 'vitest'
import { prisma } from './helpers.js' // 👈 Используй prisma из helpers

beforeAll(async () => {
	console.log('🧪 Test database connected')
})

beforeEach(async () => {
	// Очистка данных перед каждым тестом (в правильном порядке!)
	await prisma.message.deleteMany()
	await prisma.chat.deleteMany()
	await prisma.clientNutritionPlan.deleteMany()
	await prisma.nutritionMeal.deleteMany()
	await prisma.nutritionDay.deleteMany()
	await prisma.nutritionSubcategory.deleteMany()
	await prisma.nutritionCategory.deleteMany()
	await prisma.comment.deleteMany()
	await prisma.progress.deleteMany()
	await prisma.trainerClient.deleteMany()
	await prisma.refreshToken.deleteMany()
	await prisma.user.deleteMany()
})

afterAll(async () => {
	await prisma.$disconnect()
})
