import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { prisma } from '../prisma.js'
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
} from '../controllers/notification.js'
import { GetNotificationsQuerySchema } from '../validation/zod/notification/get-notifications.dto.js'
import { MarkNotificationAsReadParamsSchema } from '../validation/zod/notification/mark-as-read.dto.js'
import { hasRole } from '../middleware/hasRole.js'

export default async function notificationRoutes(app: FastifyInstance) {
	// Получение уведомлений пользователя с пагинацией
	app.get(
		'/notifications',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const query = GetNotificationsQuerySchema.parse(req.query)

			const result = await getNotifications(req.user.id, query)

			return reply.status(200).send(result)
		},
	)

	// Отметка уведомления как прочитанного
	app.patch(
		'/notifications/:id/read',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const { id } = MarkNotificationAsReadParamsSchema.parse(req.params)

			// Проверяем, что уведомление принадлежит пользователю
			const notification = await markAsRead(req.user.id, id)

			return reply.status(200).send({
				message: 'Уведомление отмечено как прочитанное',
				notification,
			})
		},
	)

	// Отметка всех уведомлений как прочитанные
	app.patch(
		'/notifications/mark-all-read',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const count = await markAllAsRead(req.user.id)

			return reply.status(200).send({
				message: `Отмечено ${count} уведомлений как прочитанные`,
				updatedCount: count,
			})
		},
	)

	// Получение количества непрочитанных уведомлений
	app.get(
		'/notifications/unread-count',
		{ preHandler: [authGuard, hasRole(['CLIENT', 'TRAINER'])] },
		async (req, reply) => {
			const unreadCount = await prisma.notification.count({
				where: {
					userId: req.user.id,
					isRead: false,
				},
			})

			console.log('unread-count for userId:', req.user.id, 'unreadCount:', unreadCount)

			return reply.status(200).send({ unreadCount })
		},
	)
}
