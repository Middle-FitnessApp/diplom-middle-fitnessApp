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
			photoFront: '/uploads/default/body-fitness.jpg',
			photoSide: '/uploads/default/body-fitness.jpg',
			photoBack: '/uploads/default/body-fitness.jpg',
		},
	})

	// Создаём отчеты прогресса для клиента 1 (7 штук за 6 месяцев)
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
			trainerComment: 'Отличный прогресс! Продолжаем в том же духе.',
			commentedAt: new Date('2024-07-02'),
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
			trainerComment: 'Хорошая динамика, но следи за питанием.',
			commentedAt: new Date('2024-09-03'),
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
			trainerComment: 'Супер! Цель почти достигнута.',
			commentedAt: new Date('2024-11-02'),
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

	for (const progress of client1Progress) {
		await prisma.progress.create({
			data: {
				userId: client1.id,
				height: 180,
				photoFront: '/uploads/default/body-fitness.jpg',
				photoSide: '/uploads/default/body-fitness.jpg',
				photoBack: '/uploads/default/body-fitness.jpg',
				...progress,
			},
		})
	}

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
			photoFront: '/uploads/default/body-fitness.jpg',
			photoSide: '/uploads/default/body-fitness.jpg',
			photoBack: '/uploads/default/body-fitness.jpg',
		},
	})

	// Создаём отчеты прогресса для клиента 2 (7 штук за 6 месяцев)
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
			trainerComment: 'Молодец! Видны первые результаты.',
			commentedAt: new Date('2024-07-02'),
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
			trainerComment: 'Отлично! Не забывай про растяжку.',
			commentedAt: new Date('2024-09-04'),
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
			trainerComment: 'Прекрасная работа! Держи темп.',
			commentedAt: new Date('2024-11-03'),
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

	for (const progress of client2Progress) {
		await prisma.progress.create({
			data: {
				userId: client2.id,
				height: 165,
				photoFront: '/uploads/default/body-fitness.jpg',
				photoSide: '/uploads/default/body-fitness.jpg',
				photoBack: '/uploads/default/body-fitness.jpg',
				...progress,
			},
		})
	}

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
