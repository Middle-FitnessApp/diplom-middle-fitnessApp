import { useState, useEffect } from 'react'
import { Button, Badge, Avatar, Typography, Empty, Popover, theme } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
	useGetNotificationsQuery,
	useMarkAsReadMutation,
} from '../../store/api/notifications.api'
import { markAsRead } from '../../store/slices/notifications.slice'
import type { Notification } from '../../types/notifications'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ru'
import { useNavigate } from 'react-router-dom'

dayjs.extend(relativeTime)
dayjs.locale('ru')

import { getNotificationIcon, getNotificationTitle } from '../../utils/notificationUtils'

const { Text } = Typography

export function NotificationDropdown() {
	const dispatch = useAppDispatch()
	const [visible, setVisible] = useState(false)
	const themeState = useAppSelector((state) => state.ui.theme)
	const navigate = useNavigate()
	const { token } = theme.useToken()

	// Загружаем последние 5 непрочитанных уведомлений
	const { data, refetch } = useGetNotificationsQuery({ page: 1, limit: 5, isRead: false })
	const [markAsReadMutation] = useMarkAsReadMutation()

	const unreadCount = useAppSelector((state) => state.notifications.unreadCount)

	// Автоматически обновляем данные при новом уведомлении
	useEffect(() => {
		if (unreadCount > 0) {
			refetch()
		}
	}, [unreadCount, refetch])

	// Стили для тёмной темы
	const dropdownBgClass = themeState === 'dark' ? 'bg-slate-800' : 'bg-white'
	const borderClass = themeState === 'dark' ? 'border-slate-700' : 'border-gray-200'
	const textPrimaryStyle = { color: token.colorText }
	const textSecondaryStyle = { color: token.colorTextSecondary }

	const handleMarkAsRead = async (notificationId: string) => {
		try {
			await markAsReadMutation(notificationId).unwrap()
			dispatch(markAsRead(notificationId))
		} catch {
			// Игнорируем ошибки
		}
	}

	const content = (
		<ul
			className={`${dropdownBgClass} ${borderClass} border rounded-md shadow-lg w-80 max-h-96 overflow-auto list-none p-0 m-0`}
			style={{ maxHeight: 400 }}
		>
			<li
				className={`${borderClass} border-b px-4 py-3`}
				onClick={(e) => e.stopPropagation()}
			>
				<Text strong style={textPrimaryStyle}>
					Уведомления
				</Text>
				{unreadCount > 0 && (
					<Text style={textSecondaryStyle} className='ml-2'>
						{unreadCount} непрочитанных
					</Text>
				)}
			</li>

			{!data?.notifications?.length ? (
				<li onClick={(e) => e.stopPropagation()}>
					<Empty
						description='Нет уведомлений'
						image={Empty.PRESENTED_IMAGE_SIMPLE}
						style={{ padding: 20 }}
					/>
				</li>
			) : (
				data.notifications.map((notification: Notification) => (
					<li
						key={notification.id}
						className={`hover:opacity-80 ${
							!notification.isRead
								? themeState === 'dark'
									? 'bg-slate-700'
									: 'bg-blue-50'
								: 'bg-transparent'
						} px-4 py-2 cursor-pointer flex items-center justify-between`}
						onClick={(e) => {
							e.stopPropagation()
							if (!notification.isRead) {
								handleMarkAsRead(notification.id)
							}
						}}
					>
						<div className='flex items-center flex-1'>
							<Badge dot={!notification.isRead}>
								<Avatar
									icon={getNotificationIcon(notification.type, themeState)}
									size={32}
									style={{
										backgroundColor: themeState === 'dark' ? '#374151' : '#f5f5f5',
									}}
								/>
							</Badge>
							<div className='ml-3 flex-1'>
								<div>
									<Text strong style={{ ...textPrimaryStyle, fontSize: '12px' }}>
										{getNotificationTitle(notification.type)}
									</Text>
									{!notification.isRead && <Badge status='processing' className='ml-2' />}
								</div>
								<div>
									<Text
										style={{
											...textSecondaryStyle,
											fontSize: '12px',
											display: 'block',
											marginBottom: '4px',
										}}
									>
										{notification.message}
									</Text>
									<Text
										type='secondary'
										style={{ ...textSecondaryStyle, fontSize: '12px' }}
									>
										{dayjs(notification.createdAt).fromNow()}
									</Text>
								</div>
							</div>
						</div>
						{!notification.isRead && (
							<Button
								size='small'
								type='text'
								icon={<CheckOutlined />}
								onClick={(e) => {
									e.stopPropagation()
									handleMarkAsRead(notification.id)
								}}
								style={{ border: 'none', padding: '2px' }}
							/>
						)}
					</li>
				))
			)}

			{data?.notifications && data.notifications.length > 0 && (
				<li className={`${borderClass} border-t px-4 py-2 text-center`}>
					<Button
						type='link'
						size='small'
						onClick={() => {
							setVisible(false) // Закрываем dropdown
							// Для всех пользователей - страница уведомлений
							navigate('/me/notifications')
						}}
					>
						Посмотреть все
					</Button>
				</li>
			)}
		</ul>
	)

	return (
		<Popover
			content={content}
			trigger='click'
			placement='bottomRight'
			open={visible}
			onOpenChange={setVisible}
			styles={{ body: { padding: 0, margin: 0 } }}
		>
			<div style={{ cursor: 'pointer', padding: '0 8px' }}>
				<Badge count={unreadCount} size='small' offset={[2, -2]}>
					<BellOutlined style={{ fontSize: '18px' }} />
				</Badge>
			</div>
		</Popover>
	)
}
