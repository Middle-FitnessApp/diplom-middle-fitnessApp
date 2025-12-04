import { prisma } from '../prisma.js'

/**
 * Получение всех тренеров для публичного просмотра
 * @returns Список тренеров с базовой информацией
 */
export async function getAllTrainers() {
	return await prisma.user.findMany({
		where: { role: 'TRAINER' },
		select: {
			id: true,
			name: true,
			photo: true,
			bio: true,
			telegram: true,
			whatsapp: true,
			instagram: true,
		},
		orderBy: { name: 'asc' },
	})
}

export async function getClientsForTrainer(trainerId: string) {
	// 1) все клиенты
	const [allClients, links] = await Promise.all([
		prisma.user.findMany({
			where: { role: 'CLIENT' },
			select: {
				id: true,
				email: true,
				name: true,
				age: true,
				phone: true,
				photo: true,
				role: true,
			},
		}),
		prisma.trainerClient.findMany({
			where: { trainerId },
			select: { clientId: true, isFavorite: true },
		}),
	])

	const map = new Map<string, boolean>()
	links.forEach((l) => map.set(l.clientId, l.isFavorite))

	// 2) всем клиентам добавляем флаг isFavorite, если есть связь
	return allClients.map((c) => ({
		...c,
		isFavorite: map.get(c.id) ?? false,
	}))
}

/**
 * Получение профиля конкретного тренера
 * @param trainerId - ID тренера
 * @param clientId - ID авторизованного клиента (опционально)
 * @returns Полная информация о тренере с дополнительными полями для авторизованного клиента
 */
export async function getTrainerById(trainerId: string, clientId?: string) {
	const trainer = await prisma.user.findUnique({
		where: { id: trainerId, role: 'TRAINER' },
		select: {
			id: true,
			name: true,
			photo: true,
			age: true,
			bio: true,
			telegram: true,
			whatsapp: true,
			instagram: true,
			createdAt: true,
		},
	})

	if (!trainer) {
		return null
	}

	// Если пользователь не авторизован - возвращаем базовую информацию
	if (!clientId) {
		return trainer
	}

	// Если авторизован - проверяем связь с тренером
	const relationship = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
		select: {
			status: true,
		},
	})

	return {
		...trainer,
		inviteStatus: relationship?.status ?? null,
		isMyTrainer: relationship?.status === 'ACCEPTED',
	}
}

export async function toggleClientFavorite(trainerId: string, clientId: string) {
	const existing = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
	})

	if (!existing) {
		const created = await prisma.trainerClient.create({
			data: {
				trainerId,
				clientId,
				status: 'ACCEPTED',
				isFavorite: true,
				acceptedAt: new Date(),
			},
		})
		return created.isFavorite
	}

	const updated = await prisma.trainerClient.update({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
		data: { isFavorite: !existing.isFavorite },
	})

	return updated.isFavorite
}
