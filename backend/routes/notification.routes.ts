import { FastifyInstance } from 'fastify'
import { authGuard } from '../middleware/authGuard.js'
import { getNotifications, markAsRead } from '../controllers/notification.js'
import { GetNotificationsQuerySchema } from '../validation/zod/notification/get-notifications.dto.js'
import { MarkNotificationAsReadParamsSchema } from '../validation/zod/notification/mark-as-read.dto.js'
import { ApiError } from '../utils/ApiError.js'

export default async function notificationRoutes(app: FastifyInstance) {
	// Получение уведомлений пользователя с пагинацией
	app.get('/notifications', { preHandler: [authGuard] }, async (req, reply) => {
		const query = GetNotificationsQuerySchema.parse(req.query)

		const result = await getNotifications(req.user.id, query)

		return reply.status(200).send(result)
	})

	// Отметка уведомления как прочитанного
	app.patch(
		'/notifications/:id/read',
		{ preHandler: [authGuard] },
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
}
