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

/**
 * Отмена сотрудничества с тренером
 * @param clientId - ID клиента
 * @returns Сообщение об успешной отмене
 */
export async function cancelTrainerCooperation(clientId: string) {
	// 1. Находим активное сотрудничество с тренером
	const activeRelation = await prisma.trainerClient.findFirst({
		where: {
			clientId,
			status: 'ACCEPTED',
		},
		include: {
			trainer: {
				select: {
					id: true,
					name: true,
				},
			},
		},
	})

	if (!activeRelation) {
		throw ApiError.notFound('У вас нет активного тренера')
	}

	const trainerId = activeRelation.trainerId

	// 2. Находим все планы питания, назначенные этим тренером
	// Через цепочку: ClientNutritionPlan -> NutritionSubcategory -> NutritionCategory -> trainer
	const nutritionPlansToDelete = await prisma.clientNutritionPlan.findMany({
		where: {
			clientId,
			subcategory: {
				category: {
					trainerId,
				},
			},
		},
		select: {
			id: true,
		},
	})

	const planIds = nutritionPlansToDelete.map((plan) => plan.id)

	// 3. Удаляем связь с тренером и планы питания в транзакции
	await prisma.$transaction([
		// Удаляем связь с тренером
		prisma.trainerClient.delete({
			where: {
				id: activeRelation.id,
			},
		}),
		// Удаляем все планы питания от этого тренера
		...(planIds.length > 0
			? [
					prisma.clientNutritionPlan.deleteMany({
						where: {
							id: {
								in: planIds,
							},
						},
					}),
			  ]
			: []),
	])

	return {
		message: `Сотрудничество с тренером "${activeRelation.trainer.name}" успешно отменено`,
		deletedNutritionPlans: planIds.length,
	}
}

/**
 * Отмена приглашения тренеру
 * @param clientId - ID клиента
 * @param inviteId - ID приглашения
 * @returns Сообщение об успешной отмене
 */
export async function cancelInvite(clientId: string, inviteId: string) {
	// 1. Находим приглашение
	const invite = await prisma.trainerClient.findUnique({
		where: { id: inviteId },
		include: {
			trainer: {
				select: {
					name: true,
				},
			},
		},
	})

	if (!invite) {
		throw ApiError.notFound('Приглашение не найдено')
	}

	// 2. Проверяем, что приглашение принадлежит этому клиенту
	if (invite.clientId !== clientId) {
		throw ApiError.forbidden('Это не ваше приглашение')
	}

	// 3. Проверяем статус приглашения
	if (invite.status === 'ACCEPTED') {
		throw ApiError.badRequest(
			'Нельзя отменить принятое приглашение. Используйте DELETE /api/client/trainer для отмены сотрудничества',
		)
	}

	if (invite.status === 'REJECTED') {
		throw ApiError.badRequest('Это приглашение уже отклонено тренером')
	}

	// 4. Удаляем приглашение
	await prisma.trainerClient.delete({
		where: { id: inviteId },
	})

	return {
		message: `Приглашение тренеру "${invite.trainer.name}" успешно отменено`,
	}
}

/**
 * Отмена приглашения тренеру по ID тренера (альтернативный метод)
 * @param clientId - ID клиента
 * @param trainerId - ID тренера
 * @returns Результат отмены
 */
export async function cancelInviteByTrainer(clientId: string, trainerId: string) {
	// 1. Находим приглашение по clientId и trainerId
	const invite = await prisma.trainerClient.findUnique({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
		include: {
			trainer: {
				select: {
					name: true,
				},
			},
		},
	})

	if (!invite) {
		throw ApiError.notFound('Приглашение не найдено')
	}

	// 2. Проверяем статус приглашения
	if (invite.status === 'ACCEPTED') {
		throw ApiError.badRequest(
			'Нельзя отменить принятое приглашение. Используйте DELETE /api/client/trainer для отмены сотрудничества',
		)
	}

	if (invite.status === 'REJECTED') {
		throw ApiError.badRequest('Это приглашение уже отклонено тренером')
	}

	// 3. Удаляем приглашение
	await prisma.trainerClient.delete({
		where: {
			clientId_trainerId: {
				clientId,
				trainerId,
			},
		},
	})

	return {
		message: `Приглашение тренеру "${invite.trainer.name}" успешно отменено`,
	}
}
