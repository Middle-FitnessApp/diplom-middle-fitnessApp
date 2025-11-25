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
			weight: 75.5,
			height: 180,
			waist: 85,
			chest: 95,
			hips: 90,
			arm: 35,
			leg: 55,
			goal: 'Набрать мышечную массу',
			restrictions: 'Нет противопоказаний',
			experience: 'Занимался год в зале',
			diet: 'Обычное питание',
			photoFront: '/uploads/photos/client1-front.jpg',
			photoSide: '/uploads/photos/client1-side.jpg',
			photoBack: '/uploads/photos/client1-back.jpg',
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
			weight: 58.0,
			height: 165,
			waist: 65,
			chest: 85,
			hips: 90,
			arm: 28,
			leg: 50,
			goal: 'Похудеть и подтянуть фигуру',
			restrictions: 'Проблемы с коленями',
			experience: 'Новичок в фитнесе',
			diet: 'Стараюсь правильно питаться',
			photoFront: '/uploads/photos/client2-front.jpg',
			photoSide: '/uploads/photos/client2-side.jpg',
			photoBack: '/uploads/photos/client2-back.jpg',
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
			// Схема требует эти поля для всех пользователей - указываем заглушки для тренеров
			weight: 85.0,
			height: 185,
			waist: 80,
			chest: 105,
			hips: 95,
			arm: 40,
			leg: 60,
			goal: 'Тренер',
			restrictions: 'Нет',
			experience: 'Профессиональный тренер',
			diet: 'Спортивное питание',
			photoFront: '/uploads/photos/trainer1-front.jpg',
			photoSide: '/uploads/photos/trainer1-side.jpg',
			photoBack: '/uploads/photos/trainer1-back.jpg',
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
			// Схема требует эти поля для всех пользователей - указываем заглушки для тренеров
			weight: 60.0,
			height: 170,
			waist: 65,
			chest: 88,
			hips: 92,
			arm: 30,
			leg: 52,
			goal: 'Тренер',
			restrictions: 'Нет',
			experience: 'Профессиональный тренер',
			diet: 'Здоровое питание',
			photoFront: '/uploads/photos/trainer2-front.jpg',
			photoSide: '/uploads/photos/trainer2-side.jpg',
			photoBack: '/uploads/photos/trainer2-back.jpg',
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
