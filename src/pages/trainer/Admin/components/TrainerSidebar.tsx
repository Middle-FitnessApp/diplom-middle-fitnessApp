import React from 'react'
import { List, Avatar, Badge, Tooltip } from 'antd'
import { StarFilled, StarOutlined } from '@ant-design/icons'
import { mockTrainer } from '../mock-data'

interface SidebarProps {
	clients: Array<{
		id: string
		name: string
		avatarUrl?: string
		starred: boolean
		unreadMessages: number
		hasNewReport: boolean
	}>
	onToggleStar: (clientId: string) => void
}

export const TrainerSidebar: React.FC<SidebarProps> = ({ clients, onToggleStar }) => (
	<>
		<div className='flex items-center gap-3 mb-8 px-6'>
			<Avatar src={mockTrainer.avatarUrl} size={54} />
			<span className='font-bold text-xl'>{mockTrainer.name}</span>
		</div>
		<List
			className='space-y-2'
			dataSource={clients}
			renderItem={(client) => (
				<List.Item
					className='group hover:bg-blue-50 rounded-lg cursor-pointer px-3 py-2 transition border border-muted'
					style={{ borderBottom: '1px solid var(--border)' }}
					actions={[
						client.unreadMessages ? (
							<Badge
								count={client.unreadMessages}
								style={{ backgroundColor: 'var(--primary)' }}
							/>
						) : null,
						<span key='star-icon' onClick={() => onToggleStar(client.id)}>
							{client.starred ? (
								<Tooltip
									title='Убрать из избранных'
									color='var(--danger)'
									styles={{ body: { color: 'var(--highlight)' } }}
								>
									<StarFilled style={{ color: 'var(--warning)' }} />
								</Tooltip>
							) : (
								<Tooltip
									title='Добавить в избранное'
									color='var(--warning)'
									styles={{ body: { color: 'var(--highlight)' } }}
								>
									<StarOutlined className='text-gray-300' />
								</Tooltip>
							)}
						</span>,
					]}
				>
					<List.Item.Meta
						avatar={<Avatar src={client.avatarUrl} size={36} />}
						title={<span className='text-base font-medium'>{client.name}</span>}
					/>
				</List.Item>
			)}
		/>
	</>
)
