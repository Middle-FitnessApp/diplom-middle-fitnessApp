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
