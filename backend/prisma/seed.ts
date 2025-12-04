import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
	console.log('🌱 Начинаем заполнение базы данных...')

	// Пароль для всех тестовых пользователей
	const passwordHash = await hash('123456', 10)

	// Создаём двух клиентов
	const client1 = await prisma.user.upsert({
		where: { email: 'client1@mail.ru' },
		update: {},
		create: {
			name: 'Иван Иванов',
			email: 'client1@mail.ru',
			password: passwordHash,
			age: 25,
			role: 'CLIENT',
			goal: 'Набрать мышечную массу',
			restrictions: 'Нет противопоказаний',
			experience: 'Занимался год в зале',
			diet: 'Обычное питание',
		},
	})

	const client2 = await prisma.user.upsert({
		where: { phone: '+79161234567' },
		update: {},
		create: {
			name: 'Мария Петрова',
			phone: '+79161234567',
			password: passwordHash,
			age: 28,
			role: 'CLIENT',
			goal: 'Похудеть и подтянуть фигуру',
			restrictions: 'Проблемы с коленями',
			experience: 'Новичок в фитнесе',
			diet: 'Стараюсь правильно питаться',
		},
	})

	// Создаём двух тренеров
	const trainer1 = await prisma.user.upsert({
		where: { email: 'trainer1@mail.ru' },
		update: {},
		create: {
			name: 'Алексей Смирнов',
			email: 'trainer1@mail.ru',
			password: passwordHash,
			age: 32,
			role: 'TRAINER',
			telegram: '@trainer_alex',
			whatsapp: '+79161111111',
			instagram: '@alex_fitness_coach',
			bio: 'Сертифицированный тренер с 10-летним опытом. Специализация: набор массы, функциональный тренинг.',
		},
	})

	const trainer2 = await prisma.user.upsert({
		where: { phone: '+79162222222' },
		update: {},
		create: {
			name: 'Елена Кузнецова',
			phone: '+79162222222',
			password: passwordHash,
			age: 29,
			role: 'TRAINER',
			telegram: '@elena_fit',
			whatsapp: '+79162222222',
			instagram: '@elena_fitness',
			bio: 'Персональный тренер, специалист по йоге и пилатесу. Помогу достичь гармонии тела и духа.',
		},
	})

	// 🔥 Создаём тестовый план питания (30 дней)
	console.log('🍽️ Создаём план питания...')

	// Категория
	const nutritionCategory = await prisma.nutritionCategory.upsert({
		where: { name: 'Тестовая программа' },
		update: {},
		create: {
			name: 'Тестовая программа',
			trainerId: trainer1.id,
		},
	})

	// Программа
	const nutritionProgram = await prisma.nutritionProgram.upsert({
		where: { name: '30-дневный план питания' },
		update: {},
		create: {
			name: '30-дневный план питания',
			categoryId: nutritionCategory.id,
		},
	})

	// Меню для дней (повторяется для простоты)
	const dayMeals = [
		{
			type: 'BREAKFAST' as const,
			name: 'Завтрак',
			mealOrder: 1,
			items: [
				'яичница из двух яиц',
				'огурец свежий и болгарский перец',
				'бутерброд из бородинского хлеба с сыром тильзитер',
				'банан',
				'чай чёрный',
			],
		},
		{
			type: 'SNACK' as const,
			name: 'Перекус 1',
			mealOrder: 2,
			items: ['греческий йогурт 150г', 'миндаль 20г'],
		},
		{
			type: 'LUNCH' as const,
			name: 'Обед',
			mealOrder: 3,
			items: [
				'куриная грудка запечённая 150г',
				'рис бурый 100г',
				'салат из свежих овощей',
				'оливковое масло 1 ст.л.',
			],
		},
		{
			type: 'SNACK' as const,
			name: 'Перекус 2',
			mealOrder: 4,
			items: ['яблоко', 'творог 5% 100г'],
		},
		{
			type: 'DINNER' as const,
			name: 'Ужин',
			mealOrder: 5,
			items: ['рыба на пару 150г', 'овощи тушёные 200г', 'гречка 80г'],
		},
	]

	// Создаём 30 дней
	const programDays: string[] = []
	for (let dayNum = 1; dayNum <= 30; dayNum++) {
		const day = await prisma.programDay.create({
			data: {
				programId: nutritionProgram.id,
				dayTitle: `День ${dayNum}`,
				dayOrder: dayNum,
				meals: {
					create: dayMeals.map((meal) => ({
						...meal,
					})),
				},
			},
		})
		programDays.push(day.id)
	}

	console.log(
		`✅ Создана программа "${nutritionProgram.name}" с ${programDays.length} днями`,
	)

	// Назначаем план клиентам (все 30 дней)
	await prisma.assignedNutritionPlan.create({
		data: {
			clientId: client1.id,
			programId: nutritionProgram.id,
			dayIds: programDays,
		},
	})

	await prisma.assignedNutritionPlan.create({
		data: {
			clientId: client2.id,
			programId: nutritionProgram.id,
			dayIds: programDays,
		},
	})

	console.log('✅ План питания назначен обоим клиентам')

	// Создаём связи Trainer-Client (приглашения приняты тренером)
	await prisma.trainerClient.create({
		data: {
			trainerId: trainer1.id,
			clientId: client1.id,
			status: 'ACCEPTED',
			isFavorite: true,
			acceptedAt: new Date(),
		},
	})

	await prisma.trainerClient.create({
		data: {
			trainerId: trainer1.id,
			clientId: client2.id,
			status: 'ACCEPTED',
			isFavorite: false,
			acceptedAt: new Date(),
		},
	})

	// Создаём отчеты прогресса для client1 (7 штук)
	const client1Progress = [
		{
			date: new Date('2024-06-01'),
			weight: 80.0,
			waist: 90,
			chest: 98,
			hips: 95,
			arm: 36,
			leg: 57,
		},
		{
			date: new Date('2024-07-01'),
			weight: 78.5,
			waist: 88,
			chest: 97,
			hips: 93,
			arm: 35.5,
			leg: 56,
		},
		{
			date: new Date('2024-08-01'),
			weight: 77.0,
			waist: 86,
			chest: 96,
			hips: 92,
			arm: 35,
			leg: 55.5,
		},
		{
			date: new Date('2024-09-01'),
			weight: 76.0,
			waist: 85,
			chest: 96,
			hips: 91,
			arm: 35,
			leg: 55,
		},
		{
			date: new Date('2024-10-01'),
			weight: 75.5,
			waist: 84,
			chest: 95,
			hips: 90,
			arm: 35,
			leg: 55,
		},
		{
			date: new Date('2024-11-01'),
			weight: 75.0,
			waist: 83,
			chest: 95,
			hips: 90,
			arm: 35,
			leg: 55,
		},
		{
			date: new Date('2024-11-26'),
			weight: 74.5,
			waist: 82,
			chest: 95,
			hips: 89,
			arm: 35,
			leg: 55,
		},
	]

	const client1ProgressRecords = []
	for (const progress of client1Progress) {
		const record = await prisma.progress.create({
			data: {
				userId: client1.id,
				height: 180,
				photoFront: '/uploads/default/body-fitness.jpg',
				photoSide: '/uploads/default/body-fitness.jpg',
				photoBack: '/uploads/default/body-fitness.jpg',
				...progress,
			},
		})
		client1ProgressRecords.push(record)
	}
	const client2Progress = [
		{
			date: new Date('2024-06-01'),
			weight: 62.0,
			waist: 70,
			chest: 88,
			hips: 95,
			arm: 30,
			leg: 53,
		},
		{
			date: new Date('2024-07-01'),
			weight: 61.0,
			waist: 69,
			chest: 87,
			hips: 94,
			arm: 29.5,
			leg: 52,
		},
		{
			date: new Date('2024-08-01'),
			weight: 60.0,
			waist: 68,
			chest: 86,
			hips: 93,
			arm: 29,
			leg: 51.5,
		},
		{
			date: new Date('2024-09-01'),
			weight: 59.0,
			waist: 67,
			chest: 86,
			hips: 92,
			arm: 28.5,
			leg: 51,
		},
		{
			date: new Date('2024-10-01'),
			weight: 58.5,
			waist: 66,
			chest: 85,
			hips: 91,
			arm: 28,
			leg: 50.5,
		},
		{
			date: new Date('2024-11-01'),
			weight: 58.0,
			waist: 65,
			chest: 85,
			hips: 90,
			arm: 28,
			leg: 50,
		},
		{
			date: new Date('2024-11-26'),
			weight: 57.5,
			waist: 64,
			chest: 84,
			hips: 89,
			arm: 28,
			leg: 50,
		},
	]

	const client2ProgressRecords = []
	for (const progress of client2Progress) {
		const record = await prisma.progress.create({
			data: {
				userId: client2.id,
				height: 165,
				photoFront: '/uploads/default/body-fitness.jpg',
				photoSide: '/uploads/default/body-fitness.jpg',
				photoBack: '/uploads/default/body-fitness.jpg',
				...progress,
			},
		})
		client2ProgressRecords.push(record)
	}

	console.log('✅ База данных успешно заполнена!')
	console.log('\n📋 Созданные пользователи:')
	console.log('\n👤 Клиенты:')
	console.log(`  1. ${client1.name} (email: ${client1.email}, пароль: 123456)`)
	console.log(`  2. ${client2.name} (phone: ${client2.phone}, пароль: 123456)`)
	console.log('\n🏋️ Тренеры:')
	console.log(`  1. ${trainer1.name} (email: ${trainer1.email}, пароль: 123456)`)
	console.log(`  2. ${trainer2.name} (phone: ${trainer2.phone}, пароль: 123456)`)
	console.log('\n💡 Используйте эти данные для входа в систему\n')
}

main()
	.catch((e) => {
		console.error('❌ Ошибка при заполнении базы данных:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
