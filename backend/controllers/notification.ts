import { prisma } from '../prisma.js'
import { GetNotificationsQueryDTO } from '../validation/zod/notification/get-notifications.dto.js'
import { MarkNotificationAsReadParamsDTO } from '../validation/zod/notification/mark-as-read.dto.js'
import { ApiError } from '../utils/ApiError.js'

/**
 * Получение уведомлений пользователя с пагинацией
 * @param userId - ID пользователя
 * @param query - Параметры пагинации
 * @returns Уведомления с метаданными пагинации и счетчиком непрочитанных
 */
export async function getNotifications(userId: string, query: GetNotificationsQueryDTO) {
	console.log('getNotifications called for userId:', userId, 'query:', query)
	const { page, limit, isRead } = query

	// Вычисляем offset для пагинации
	const skip = (page - 1) * limit
	const take = limit

	// Формируем where условие
	const whereCondition: any = { userId }
	if (isRead !== undefined) {
		whereCondition.isRead = isRead
	}

	// Получаем уведомления пользователя
	const notifications = await prisma.notification.findMany({
		where: whereCondition,
		orderBy: { createdAt: 'desc' }, // Новые уведомления первыми
		skip,
		take,
	})
	console.log('Found notifications:', notifications.length, 'total:', notifications)

	// Получаем общее количество уведомлений
	const total = await prisma.notification.count({
		where: whereCondition,
	})

	// Получаем количество непрочитанных уведомлений
	const unreadCount = await prisma.notification.count({
		where: {
			userId,
			isRead: false,
		},
	})

	// Вычисляем общее количество страниц
	const totalPages = Math.ceil(total / limit)

	return {
		notifications,
		unreadCount,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	}
}

/**
 * Отметка уведомления как прочитанного
 * @param userId - ID пользователя
 * @param notificationId - ID уведомления
 * @returns Обновленное уведомление
 */
export async function markAsRead(userId: string, notificationId: string) {
	// Проверяем существование уведомления и принадлежность пользователю
	const notification = await prisma.notification.findFirst({
		where: {
			id: notificationId,
			userId,
		},
	})

	if (!notification) {
		throw ApiError.notFound('Уведомление не найдено')
	}

	if (notification.isRead) {
		throw ApiError.badRequest('Уведомление уже отмечено как прочитанное')
	}

	// Обновляем статус уведомления
	const updatedNotification = await prisma.notification.update({
		where: { id: notificationId },
		data: { isRead: true },
	})

	return updatedNotification
}

/**
 * Отметка всех уведомлений пользователя как прочитанные
 * @param userId - ID пользователя
 * @returns Количество обновленных уведомлений
 */
export async function markAllAsRead(userId: string) {
	const result = await prisma.notification.updateMany({
		where: {
			userId,
			isRead: false,
		},
		data: { isRead: true },
	})

	return result.count
}
