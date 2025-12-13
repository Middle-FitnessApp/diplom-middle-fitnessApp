import {
	BellOutlined,
	CheckCircleOutlined,
	ExclamationCircleOutlined,
	FileTextOutlined,
	MessageOutlined,
} from '@ant-design/icons'
import type { Notification } from '../types/notifications'

export const getNotificationIcon = (
	type: Notification['type'],
	theme: 'light' | 'dark' = 'light'
) => {
	switch (type) {
		case 'REPORT':
			return <FileTextOutlined style={{ color: '#1890ff' }} />
		case 'COMMENT':
			return <ExclamationCircleOutlined style={{ color: '#52c41a' }} />
		case 'PLAN':
			return (
				<CheckCircleOutlined
					style={{ color: theme === 'dark' ? '#009708' : '#d48806' }}
				/>
			)
		case 'MESSAGE':
			return (
				<MessageOutlined style={{ color: theme === 'dark' ? '#b37feb' : '#722ed1' }} />
			)
		default:
			return <BellOutlined />
	}
}

export const getNotificationTitle = (type: Notification['type']) => {
	switch (type) {
		case 'REPORT':
			return 'Новый отчет'
		case 'COMMENT':
			return 'Комментарий тренера'
		case 'PLAN':
			return 'Новый план питания'
		case 'MESSAGE':
			return 'Новое сообщение'
		default:
			return 'Уведомление'
	}
}