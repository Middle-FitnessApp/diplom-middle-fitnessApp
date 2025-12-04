import { prisma } from '../prisma.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Отправка приглашения тренеру
 * @param clientId - ID клиента
 * @param trainerId - ID тренера
 * @returns Созданное приглашение
 */
export async function inviteTrainer(clientId: string, trainerId: string) {
	// 1. Проверяем, существует ли тренер
	const trainer = await prisma.user.findUnique({
		where: { id: trainerId, role: 'TRAINER' },
	})

	if (!trainer) {
		throw ApiError.notFound('Тренер не найден')
	}

	// 2. Проверяем, нет ли уже активного тренера (ACCEPTED)
	const activeTrainer = await prisma.trainerClient.findFirst({
		where: {
			clientId,
			status: 'ACCEPTED',
		},
	})

	if (activeTrainer) {
		throw ApiError.badRequest('У вас уже есть активный тренер')
	}

	// 3. Проверяем, не отправлено ли уже приглашение этому тренеру
	const existingInvite = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
	})

	if (existingInvite) {
		if (existingInvite.status === 'PENDING') {
			throw ApiError.badRequest('Приглашение этому тренеру уже отправлено')
		}
		if (existingInvite.status === 'REJECTED') {
			throw ApiError.badRequest('Тренер уже отклонил ваше приглашение')
		}
	}

	// 4. Проверяем лимит активных приглашений (максимум 5)
	const pendingInvitesCount = await prisma.trainerClient.count({
		where: {
			clientId,
			status: 'PENDING',
		},
	})

	if (pendingInvitesCount >= 5) {
		throw ApiError.badRequest('Превышен лимит активных приглашений (максимум 5)')
	}

	// 5. Создаем приглашение
	const invite = await prisma.trainerClient.create({
		data: {
			clientId,
			trainerId,
			status: 'PENDING',
		},
		select: {
			id: true,
			trainerId: true,
			status: true,
			createdAt: true,
		},
	})

	return invite
}
