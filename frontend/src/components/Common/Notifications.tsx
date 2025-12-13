import { useState, useEffect } from 'react'
import {
	List,
	Button,
	Badge,
	Empty,
	Spin,
	message,
	Avatar,
	Typography,
	Pagination,
} from 'antd'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useThemeClasses } from '../../hooks/useThemeClasses'
import {
	useGetNotificationsQuery,
	useMarkAsReadMutation,
	useMarkAllAsReadMutation,
} from '../../store/api/notifications.api'
import {
	markAsRead,
	markAllAsRead,
	setUnreadCount,
} from '../../store/slices/notifications.slice'
import type { Notification } from '../../types/notifications'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ru'
import { NOTIFICATIONS_LIMIT } from '../../constants/pagination'

dayjs.extend(relativeTime)
dayjs.locale('ru')

import { getNotificationIcon, getNotificationTitle } from '../../utils/notificationUtils'

const { Text, Title } = Typography

export function Notifications() {
	const dispatch = useAppDispatch()
	const themeClasses = useThemeClasses()
	const [page, setPage] = useState(1)
	const limit = NOTIFICATIONS_LIMIT

	const { data, isLoading, error, refetch } = useGetNotificationsQuery({ page, limit })
	console.log('Notifications data:', data, 'isLoading:', isLoading, 'error:', error)

	const user = useAppSelector((state) => state.auth.user)
	console.log('Current user in Notifications:', user)
	const theme = useAppSelector((state) => state.ui.theme)
	const [markAsReadMutation] = useMarkAsReadMutation()
	const [markAllAsReadMutation] = useMarkAllAsReadMutation()

	const unreadCount = useAppSelector((state) => state.notifications.unreadCount)

	// Синхронизируем счетчик непрочитанных с данными из API
	useEffect(() => {
		if (data?.unreadCount !== undefined) {
			dispatch(setUnreadCount(data.unreadCount))
		}
	}, [data?.unreadCount, dispatch])

	// Автоматически обновляем данные при изменении счетчика непрочитанных
	// (означает, что пришло новое уведомление через Socket.IO)
	useEffect(() => {
		if (unreadCount > 0) {
			refetch()
		}
	}, [unreadCount, refetch])

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markAsReadMutation(notificationId).unwrap()
			dispatch(markAsRead(notificationId))
			message.success('Уведомление отмечено как прочитанное')
		} catch {
			message.error('Ошибка при отметке уведомления')
		}
	}

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsReadMutation().unwrap()
			dispatch(markAllAsRead())
			message.success('Все уведомления отмечены как прочитанные')
		} catch {
			message.error('Ошибка при отметке уведомлений')
		}
	}

	if (error) {
		return (
			<div className='flex justify-center items-center h-64'>
				<div className='text-red-500'>Ошибка загрузки уведомлений</div>
			</div>
		)
	}

	if (isLoading && page === 1) {
		return (
			<div className='flex justify-center items-center h-64'>
				<Spin size='large' />
			</div>
		)
	}

	return (
		<div className='gradient-bg min-h-[calc(100vh-4rem)] p-10 flex justify-center items-start'>
			<div
				className={`${themeClasses.cardBg} rounded-2xl p-10 shadow-xl border ${themeClasses.border} w-full max-w-[800px]`}
			>
				<div className='text-center mb-8'>
					<Title
						level={2}
						className={`${themeClasses.title} font-semibold mb-2 pb-3 border-b-3 border-primary inline-block`}
					>
						🔔 Уведомления
					</Title>
					{unreadCount > 0 && (
						<div className='mt-2'>
							<Text type='secondary' className={`${themeClasses.textSecondary} text-sm`}>
								{unreadCount} непрочитанных
							</Text>
						</div>
					)}
				</div>

				{data?.notifications && data.notifications.length > 0 && unreadCount > 0 && (
					<div className='flex justify-center mb-6'>
						<Button onClick={handleMarkAllAsRead} type='primary'>
							Отметить все как прочитанные
						</Button>
					</div>
				)}

				{!data?.notifications.length ? (
					<Empty
						description={
							<span className={themeClasses.textSecondary}>
								У вас пока нет уведомлений
							</span>
						}
						image={Empty.PRESENTED_IMAGE_SIMPLE}
					/>
				) : (
					<List
						dataSource={data.notifications}
						renderItem={(notification: Notification) => (
							<List.Item
								className={`p-4! rounded-lg border mb-2 transition-colors ${
									!notification.isRead
										? `${themeClasses.notificationUnreadBg} ${themeClasses.notificationUnreadBorder}`
										: `${themeClasses.notificationReadBg} ${themeClasses.notificationReadBorder}`
								}`}
								actions={
									!notification.isRead
										? [
												<Button
													key='mark-read'
													size='small'
													onClick={() => handleMarkAsRead(notification.id)}
												>
													Отметить прочитанным
												</Button>,
										  ]
										: []
								}
							>
								<List.Item.Meta
									avatar={
										<Badge dot={!notification.isRead}>
											<Avatar
												icon={getNotificationIcon(notification.type, theme)}
												className={themeClasses.notificationAvatarBg}
											/>
										</Badge>
									}
									title={
										<div className='flex items-center gap-2'>
											<Text strong className={themeClasses.title}>
												{getNotificationTitle(notification.type)}
											</Text>
											{!notification.isRead && <Badge status='processing' />}
										</div>
									}
									description={
										<div>
											<Text className={`block mb-1 ${themeClasses.title}`}>
												{notification.message}
											</Text>
											<Text
												type='secondary'
												className={`text-sm ${themeClasses.textSecondary}`}
											>
												{dayjs(notification.createdAt).fromNow()}
											</Text>
										</div>
									}
								/>
							</List.Item>
						)}
					/>
				)}

				{data && data.pagination.totalPages > 1 && (
					<div className='flex justify-center mt-8'>
						<Pagination
							current={page}
							total={data.pagination.total || 0}
							pageSize={limit}
							onChange={(newPage) => setPage(newPage)}
							showSizeChanger={false}
							showTotal={(total) => `Всего ${total} уведомлений`}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
