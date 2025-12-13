import { prisma } from '../prisma.js'
import { NotificationType } from '@prisma/client'
import { Server as SocketIOServer } from 'socket.io'

export async function createNotification(
	userId: string,
	type: NotificationType,
	message: string,
	io: SocketIOServer, // Socket.IO server instance
) {
	console.log('Creating notification:', { userId, type, message })
	// Создаём уведомление в базе данных
	const notification = await prisma.notification.create({
		data: {
			userId,
			type,
			message,
		},
	})

	// Отправляем уведомление через Socket.IO в комнату пользователя
	io.to(`user_${userId}`).emit('notification', {
		id: notification.id,
		type: notification.type,
		message: notification.message,
		createdAt: notification.createdAt,
		isRead: notification.isRead,
	})

	return notification
}
