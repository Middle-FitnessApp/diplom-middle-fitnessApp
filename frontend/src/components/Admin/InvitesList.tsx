import React from 'react'
import { Card, List, Avatar, Button, Typography, Tag, Empty, Space } from 'antd'
import { UserOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import type { TrainerInvite } from '../../store/api/trainer.api'
import { useAppSelector } from '../../store/hooks'

const { Text, Paragraph } = Typography

interface InvitesListProps {
	invites: TrainerInvite[]
	loading?: boolean
	onAccept: (inviteId: string) => void
	onReject: (inviteId: string) => void
	acceptingId?: string | null
	rejectingId?: string | null
}

export const InvitesList: React.FC<InvitesListProps> = ({
	invites,
	loading = false,
	onAccept,
	onReject,
	acceptingId,
	rejectingId,
}) => {
	const theme = useAppSelector((state) => state.ui.theme)
	const isDark = theme === 'dark'

	// Hover класс в зависимости от темы
	const hoverClass = isDark
		? 'hover:bg-slate-700/50'
		: 'hover:bg-slate-100'

	const getPhotoUrl = (photo: string | null) => {
		if (!photo) return undefined
		return photo.startsWith('http') ? photo : `http://localhost:3000${photo}`
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString)
		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<Card
			title={
				<span className='text-lg font-semibold tracking-tight'>
					📨 Новые заявки
					{invites.length > 0 && (
						<Tag color='blue' style={{ marginLeft: 8 }}>
							{invites.length}
						</Tag>
					)}
				</span>
			}
			className='shadow-lg h-full'
			styles={{
				body: {
					padding: '18px 14px 10px 14px',
					background: 'var(--bg-light)',
				},
			}}
		>
			{invites.length === 0 ? (
				<Empty
					image={Empty.PRESENTED_IMAGE_SIMPLE}
					description={<Text type='secondary'>Нет новых заявок от клиентов</Text>}
				/>
			) : (
				<List
					loading={loading}
					itemLayout='horizontal'
					dataSource={invites}
					renderItem={(invite) => (
						<List.Item
							className={`${hoverClass} rounded-lg px-3 py-3 transition-colors duration-200`}
							style={{ borderBottom: '1px solid var(--border)' }}
						>
							<div className='flex items-center gap-4 w-full'>
								<Avatar
									size={48}
									src={getPhotoUrl(invite.client.photo)}
									icon={<UserOutlined />}
									style={{
										border: '2px solid var(--primary)',
									}}
								/>
								<div className='flex-1 min-w-0'>
									<Text strong className='block text-base'>
										{invite.client.name}
									</Text>
									{invite.client.goal && (
										<Paragraph
											type='secondary'
											className='mb-0! text-sm!'
											ellipsis={{ rows: 1 }}
										>
											Цель: {invite.client.goal}
										</Paragraph>
									)}
									<Text type='secondary' className='text-xs'>
										{formatDate(invite.createdAt)}
									</Text>
								</div>
								<Space>
									<Button
										type='primary'
										icon={<CheckOutlined />}
										onClick={() => onAccept(invite.id)}
										loading={acceptingId === invite.id}
										style={{
											background: 'var(--success)',
											borderColor: 'var(--success)',
										}}
									>
										Принять
									</Button>
									<Button
										danger
										icon={<CloseOutlined />}
										onClick={() => onReject(invite.id)}
										loading={rejectingId === invite.id}
									>
										Отклонить
									</Button>
								</Space>
							</div>
						</List.Item>
					)}
				/>
			)}
		</Card>
	)
}
